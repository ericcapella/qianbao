import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    try {
        const { symbol, date } = await request.json()
        console.log(
            `Received request to add/update asset: ${symbol} from date: ${date}`
        )

        const client = await clientPromise
        const db = client.db("stocktracker")
        const collection = db.collection("assets")

        const existingAsset = await collection.findOne({ symbol })
        const inputDate = new Date(date)
        let shouldFetchDailyData = false
        let shouldFetchWeeklyData = false

        if (existingAsset) {
            console.log(`Asset ${symbol} found in database`)
            const priceDates = Object.keys(existingAsset.prices)
            const mostRecentDate = new Date(
                Math.max(...priceDates.map((d) => new Date(d)))
            )
            const oldestDate = new Date(
                Math.min(...priceDates.map((d) => new Date(d)))
            )
            const twoDaysAgo = new Date()
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

            if (mostRecentDate < twoDaysAgo) {
                console.log(
                    `Asset ${symbol} data needs updating with recent prices. Fetching DAILY data from Alpha Vantage.`
                )
                shouldFetchDailyData = true
            }

            if (inputDate < oldestDate) {
                console.log(
                    `Asset ${symbol} data needs updating with older prices. Fetching WEEKLY data from Alpha Vantage.`
                )
                shouldFetchWeeklyData = true
            }

            if (!shouldFetchDailyData && !shouldFetchWeeklyData) {
                console.log(
                    `Asset ${symbol} data is up to date. No need to fetch from Alpha Vantage.`
                )
                return NextResponse.json(
                    { message: "Asset data is up to date" },
                    { status: 200 }
                )
            }
        } else {
            console.log(
                `Asset ${symbol} not found in database. Fetching both DAILY and WEEKLY data from Alpha Vantage.`
            )
            shouldFetchDailyData = true
            shouldFetchWeeklyData = true
        }

        let updatedPrices = existingAsset ? { ...existingAsset.prices } : {}

        if (shouldFetchDailyData) {
            const dailyData = await fetchAlphaVantageData(
                symbol,
                "DAILY",
                inputDate
            )
            updatedPrices = mergePrices(updatedPrices, dailyData)
        }

        if (shouldFetchWeeklyData) {
            const weeklyData = await fetchAlphaVantageData(
                symbol,
                "WEEKLY",
                inputDate
            )
            updatedPrices = mergePrices(updatedPrices, weeklyData)
        }

        // Filter out any prices older than the input date
        updatedPrices = Object.fromEntries(
            Object.entries(updatedPrices).filter(
                ([dateStr]) => new Date(dateStr) >= inputDate
            )
        )

        // Sort prices by date in descending order
        updatedPrices = Object.fromEntries(
            Object.entries(updatedPrices).sort(
                (a, b) => new Date(b[0]) - new Date(a[0])
            )
        )

        await collection.updateOne(
            { symbol },
            {
                $set: {
                    symbol,
                    lastRefreshed: new Date(),
                    prices: updatedPrices,
                },
            },
            { upsert: true }
        )
        console.log(`Asset ${symbol} data updated in database`)

        return NextResponse.json(
            { message: "Asset data updated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error adding/updating asset:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

async function fetchAlphaVantageData(symbol, timeSeriesType, inputDate) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_${timeSeriesType}&symbol=${symbol}&apikey=${apiKey}`

    console.log(
        `Fetching ${timeSeriesType} data from Alpha Vantage for ${symbol}`
    )
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (data["Error Message"]) {
        console.log(`Error from Alpha Vantage: ${data["Error Message"]}`)
        throw new Error("Invalid symbol")
    }

    const timeSeriesKey =
        timeSeriesType === "DAILY"
            ? "Time Series (Daily)"
            : "Weekly Time Series"
    const timeSeries = data[timeSeriesKey]

    if (!timeSeries) {
        console.log(`No time series data found for ${symbol}`)
        throw new Error("No data available for this symbol")
    }

    return Object.entries(timeSeries).reduce((acc, [dateStr, values]) => {
        if (new Date(dateStr) >= inputDate) {
            acc[dateStr] = values["4. close"]
        }
        return acc
    }, {})
}

function mergePrices(existingPrices, newPrices) {
    return { ...existingPrices, ...newPrices }
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
        const { symbol, date, shares, totalPaid, userEmail, operation } =
            await request.json()
        const client = await clientPromise
        const db = client.db("stocktracker")
        const transactionsCollection = db.collection("transactions")
        const portfoliosCollection = db.collection("portfolios")

        if (
            !symbol ||
            !date ||
            !shares ||
            !totalPaid ||
            !userEmail ||
            !operation
        ) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        const newTransaction = {
            symbol,
            date,
            shares,
            totalPaid,
            userEmail,
            operation,
        }

        await transactionsCollection.insertOne(newTransaction)

        const portfolio = await portfoliosCollection.findOne({ userEmail })
        let updatedAsset = {
            shares: parseFloat(shares),
            totalPaid: parseFloat(totalPaid),
            paidPerShare: parseFloat(totalPaid) / parseFloat(shares),
        }

        if (portfolio && portfolio.assets && portfolio.assets[symbol]) {
            const existingAsset = portfolio.assets[symbol]
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
                    [`assets.${symbol}`]: updatedAsset,
                    lastRefreshed: new Date(),
                },
                $setOnInsert: { userEmail },
            },
            { upsert: true }
        )

        return NextResponse.json(
            { message: "Transaction added successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error adding transaction:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
