import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    try {
        const { symbol, date, assetType } = await request.json()
        const client = await clientPromise
        const db = client.db("stocktracker")
        const assetsCollection = db.collection("assets")

        const existingAsset = await assetsCollection.findOne({ symbol })

        if (assetType === "custom") {
            console.log(
                `Asset ${symbol} is a custom asset. No need to fetch prices.`
            )
            return NextResponse.json({
                message: "Custom asset processed successfully",
            })
        }

        const inputDate = new Date(date)
        const twoDaysAgo = new Date()
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

        let prices = existingAsset ? existingAsset.prices || {} : {}
        let needsUpdate = false

        if (!existingAsset || Object.keys(prices).length === 0) {
            needsUpdate = true
        } else {
            const mostRecentDate = new Date(
                Math.max(...Object.keys(prices).map((date) => new Date(date)))
            )
            if (mostRecentDate < twoDaysAgo) {
                needsUpdate = true
            }

            const oldestDate = new Date(
                Math.min(...Object.keys(prices).map((date) => new Date(date)))
            )
            if (inputDate < oldestDate) {
                needsUpdate = true
            }
        }

        if (needsUpdate) {
            const timeSeriesType = "DAILY"
            const newPrices = await fetchPricesFromAlphaVantage(
                symbol,
                timeSeriesType,
                inputDate,
                assetType
            )
            prices = mergePrices(prices, newPrices)
        }

        await assetsCollection.updateOne(
            { symbol },
            {
                $set: {
                    symbol,
                    prices,
                    lastRefreshed: new Date(),
                    assetType,
                },
            },
            { upsert: true }
        )

        return NextResponse.json({
            message: "Asset added/updated successfully",
        })
    } catch (error) {
        console.error("Error adding/updating asset:", error)
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}
function mergePrices(existingPrices, newPrices) {
    const mergedPrices = { ...existingPrices }
    for (const [date, price] of Object.entries(newPrices)) {
        if (
            !mergedPrices[date] ||
            new Date(date) > new Date(Object.keys(existingPrices)[0])
        ) {
            mergedPrices[date] = price
        }
    }
    return mergedPrices
}

export async function fetchPricesFromAlphaVantage(
    symbol,
    timeSeriesType,
    inputDate,
    assetType
) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    const unescapedSymbol = symbol.replace(/\uFF0E/g, ".")
    let apiUrl

    if (assetType === "crypto") {
        apiUrl = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${unescapedSymbol}&market=EUR&apikey=${apiKey}&outputsize=full`
    } else {
        apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_${timeSeriesType}&symbol=${unescapedSymbol}&apikey=${apiKey}&outputsize=full`
    }

    console.log(
        `Fetching ${timeSeriesType} data from Alpha Vantage for ${unescapedSymbol}`
    )
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (data["Error Message"]) {
        console.log(`Error from Alpha Vantage: ${data["Error Message"]}`)
        throw new Error("Invalid symbol")
    }

    const timeSeriesKey =
        assetType === "crypto"
            ? "Time Series (Digital Currency Daily)"
            : timeSeriesType === "DAILY"
            ? "Time Series (Daily)"
            : "Weekly Time Series"
    const timeSeries = data[timeSeriesKey]

    if (!timeSeries) {
        console.log(`No time series data found for ${unescapedSymbol}`)
        throw new Error("No data available for this symbol")
    }

    return Object.entries(timeSeries).reduce((acc, [dateStr, values]) => {
        if (new Date(dateStr) >= inputDate) {
            acc[dateStr] =
                assetType === "crypto" ? values["4. close"] : values["4. close"]
        }
        return acc
    }, {})
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const symbols = searchParams.get("symbols")

        if (!symbols) {
            return NextResponse.json(
                { error: "Symbols are required" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("stocktracker")
        const assetsCollection = db.collection("assets")

        const assets = await assetsCollection
            .find({ symbol: { $in: symbols.split(",") } })
            .toArray()

        return NextResponse.json(assets)
    } catch (error) {
        console.error("Error fetching assets:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function PUT(request) {
    try {
        const {
            symbol,
            date,
            shares,
            totalAmount,
            userEmail,
            operation,
            assetType,
        } = await request.json()
        const client = await clientPromise
        const db = client.db("stocktracker")
        const transactionsCollection = db.collection("transactions")
        const portfoliosCollection = db.collection("portfolios")
        const assetsCollection = db.collection("assets")

        if (
            !symbol ||
            !date ||
            !shares ||
            !totalAmount ||
            !userEmail ||
            !operation ||
            !assetType
        ) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        if (operation === "buy") {
            return handleBuyTransaction(
                symbol,
                date,
                shares,
                totalAmount,
                userEmail,
                transactionsCollection,
                portfoliosCollection,
                assetType
            )
        } else if (operation === "sell") {
            return handleSellTransaction(
                symbol,
                date,
                shares,
                totalAmount,
                userEmail,
                transactionsCollection,
                portfoliosCollection,
                assetsCollection,
                assetType
            )
        } else {
            return NextResponse.json(
                { error: "Invalid operation" },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error("Error processing transaction:", error)
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

async function handleBuyTransaction(
    symbol,
    date,
    shares,
    totalPaid,
    userEmail,
    transactionsCollection,
    portfoliosCollection,
    assetType
) {
    const escapedSymbol = symbol.replace(/\./g, "\uFF0E") // Escape dots

    const newTransaction = {
        symbol: escapedSymbol, // Store escaped symbol
        date,
        shares: parseFloat(shares),
        totalPaid: parseFloat(totalPaid),
        userEmail,
        operation: "buy",
    }

    await transactionsCollection.insertOne(newTransaction)

    const portfolio = await portfoliosCollection.findOne({ userEmail })
    let updatedAsset = {
        shares: parseFloat(shares),
        totalPaid: parseFloat(totalPaid),
        paidPerShare: parseFloat(totalPaid) / parseFloat(shares),
    }

    if (portfolio && portfolio.assets && portfolio.assets[escapedSymbol]) {
        const existingAsset = portfolio.assets[escapedSymbol]
        updatedAsset = {
            shares: existingAsset.shares + parseFloat(shares),
            totalPaid: existingAsset.totalPaid + parseFloat(totalPaid),
            paidPerShare:
                (existingAsset.totalPaid + parseFloat(totalPaid)) /
                (existingAsset.shares + parseFloat(shares)),
        }
    }

    await portfoliosCollection.updateOne(
        { userEmail },
        {
            $set: {
                [`assets.${escapedSymbol}`]: updatedAsset,
                lastRefreshed: new Date(),
            },
            $setOnInsert: { userEmail },
        },
        { upsert: true }
    )

    return NextResponse.json(
        { message: "Buy transaction added successfully" },
        { status: 201 }
    )
}

async function handleSellTransaction(
    symbol,
    date,
    shares,
    totalReceived,
    userEmail,
    transactionsCollection,
    portfoliosCollection,
    assetsCollection,
    assetType
) {
    console.log("Entering handleSellTransaction")
    console.log("Symbol:", symbol)
    console.log("Date:", date)
    console.log("Shares:", shares)
    console.log("Total Received:", totalReceived)
    console.log("User Email:", userEmail)
    console.log("Asset Type:", assetType)

    const escapedSymbol = symbol.replace(/\./g, "．")
    console.log("Escaped Symbol:", escapedSymbol)

    const portfolio = await portfoliosCollection.findOne({ userEmail })
    console.log("Portfolio:", JSON.stringify(portfolio))

    if (!portfolio || !portfolio.assets[escapedSymbol]) {
        console.log("Asset not found in portfolio")
        return NextResponse.json(
            { error: "Asset not found in portfolio" },
            { status: 404 }
        )
    }

    const existingAsset = portfolio.assets[escapedSymbol]
    console.log("Existing Asset:", JSON.stringify(existingAsset))

    const isCustomAsset = assetType === "custom"
    console.log("Is Custom Asset:", isCustomAsset)

    let sharesToSell = parseFloat(shares)
    let totalCostBasis = 0

    if (sharesToSell > existingAsset.shares) {
        return NextResponse.json(
            { error: "Not enough shares to sell" },
            { status: 400 }
        )
    }

    if (isCustomAsset) {
        console.log("Processing custom asset sell")
        totalCostBasis = existingAsset.paidPerShare * sharesToSell
    } else {
        console.log("Processing non-custom asset sell")
        const buyTransactions = await transactionsCollection
            .find({ userEmail, symbol: escapedSymbol, operation: "buy" })
            .sort({ date: 1 })
            .toArray()
        console.log("Buy Transactions:", JSON.stringify(buyTransactions))

        for (let buyTx of buyTransactions) {
            if (sharesToSell <= 0) break

            const availableShares = buyTx.shares - (buyTx.soldShares || 0)
            const sharesToSellFromThisTx = Math.min(
                availableShares,
                sharesToSell
            )

            totalCostBasis +=
                (sharesToSellFromThisTx / buyTx.shares) * buyTx.totalPaid
            sharesToSell -= sharesToSellFromThisTx

            await transactionsCollection.updateOne(
                { _id: buyTx._id },
                { $inc: { soldShares: sharesToSellFromThisTx } }
            )
        }
    }

    const pnl = parseFloat(totalReceived) - totalCostBasis
    console.log("Calculated PNL:", pnl)

    const newSellTransaction = {
        symbol: escapedSymbol,
        date,
        shares: parseFloat(shares),
        totalReceived: parseFloat(totalReceived),
        userEmail,
        operation: "sell",
        pnl,
    }
    console.log("New Sell Transaction:", JSON.stringify(newSellTransaction))

    await transactionsCollection.insertOne(newSellTransaction)

    const updatedShares = existingAsset.shares - parseFloat(shares)
    console.log("Updated Shares:", updatedShares)

    if (updatedShares === 0) {
        console.log("Removing asset from portfolio")
        await portfoliosCollection.updateOne(
            { userEmail },
            {
                $unset: { [`assets.${escapedSymbol}`]: "" },
                $set: { lastRefreshed: new Date() },
            }
        )
    } else {
        console.log("Updating asset in portfolio")
        const updatedAsset = {
            shares: updatedShares,
            totalPaid: existingAsset.totalPaid - totalCostBasis,
            paidPerShare:
                (existingAsset.totalPaid - totalCostBasis) / updatedShares,
        }
        console.log("Updated Asset:", JSON.stringify(updatedAsset))

        await portfoliosCollection.updateOne(
            { userEmail },
            {
                $set: {
                    [`assets.${escapedSymbol}`]: updatedAsset,
                    lastRefreshed: new Date(),
                },
            }
        )
    }

    return NextResponse.json({
        message: "Sell transaction processed successfully",
    })
}
