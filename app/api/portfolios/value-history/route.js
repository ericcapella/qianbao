import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const userEmail = searchParams.get("userEmail")
        const timeRange = searchParams.get("timeRange")
        const includeTransactions =
            searchParams.get("includeTransactions") === "true"

        if (!userEmail) {
            return NextResponse.json(
                { error: "User email is required" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("stocktracker")
        const transactionsCollection = db.collection("transactions")
        const assetsCollection = db.collection("assets")

        const transactions = await transactionsCollection
            .find({ userEmail })
            .toArray()
        const symbols = [...new Set(transactions.map((t) => t.symbol))]
        const assetPrices = await Promise.all(
            symbols.map(async (symbol) => {
                const asset = await assetsCollection.findOne({ symbol })
                return { symbol, prices: asset.prices }
            })
        )

        const {
            history,
            totalValue,
            variation,
            startValue,
            totalInvestedInPeriod,
            totalSoldInPeriod,
            totalPnLInPeriod,
        } = calculatePortfolioHistory(transactions, assetPrices, timeRange)

        const response = {
            history,
            totalValue,
            variation,
            startValue,
            totalInvestedInPeriod,
            totalSoldInPeriod,
            totalPnLInPeriod,
            transactions: transactions.map((t) => ({
                date: t.date,
                operation: t.operation,
                symbol: t.symbol,
                shares: t.shares,
                totalPaid: t.totalPaid,
                totalReceived: t.totalReceived,
                pnl: t.pnl,
            })),
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error calculating portfolio value history:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

function calculatePortfolioHistory(transactions, assetPrices, timeRange) {
    const portfolioHistory = []
    const startDate = getStartDate(transactions, timeRange)
    const endDate = new Date()

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date))

    let totalInvestedInPeriod = 0
    let totalSoldInPeriod = 0
    let totalPnLInPeriod = 0
    let startValue = 0
    let lastKnownValue = 0
    let portfolio = {}
    let lastKnownPrices = {}

    // Calculate initial portfolio state
    transactions.forEach((t) => {
        if (new Date(t.date) <= startDate) {
            if (!portfolio[t.symbol]) {
                portfolio[t.symbol] = 0
            }
            if (t.operation === "buy") {
                portfolio[t.symbol] += parseFloat(t.shares)
            } else if (t.operation === "sell") {
                portfolio[t.symbol] -= parseFloat(t.shares)
            }
        }
    })

    // Calculate initial portfolio value
    startValue = calculatePortfolioValue(
        portfolio,
        assetPrices,
        startDate,
        lastKnownPrices
    )
    lastKnownValue = startValue

    for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
    ) {
        const dailyTransactions = transactions.filter(
            (t) => new Date(t.date).toDateString() === date.toDateString()
        )

        dailyTransactions.forEach((t) => {
            if (!portfolio[t.symbol]) {
                portfolio[t.symbol] = 0
            }
            if (t.operation === "buy") {
                portfolio[t.symbol] += parseFloat(t.shares)
                totalInvestedInPeriod += parseFloat(t.totalPaid)
            } else if (t.operation === "sell") {
                portfolio[t.symbol] -= parseFloat(t.shares)
                totalSoldInPeriod += parseFloat(t.totalReceived)
                totalPnLInPeriod += parseFloat(t.pnl || 0)
            }
        })

        const portfolioValue = calculatePortfolioValue(
            portfolio,
            assetPrices,
            date,
            lastKnownPrices
        )

        // Update last known prices
        Object.entries(portfolio).forEach(([symbol, shares]) => {
            const asset = assetPrices.find((a) => a.symbol === symbol)
            if (asset) {
                const price = findClosestPrice(asset.prices, date)
                if (price !== 0) {
                    lastKnownPrices[symbol] = price
                }
            }
        })

        let valueToUse = portfolioValue !== 0 ? portfolioValue : lastKnownValue

        if (valueToUse !== 0) {
            lastKnownValue = valueToUse
        }

        portfolioHistory.push({
            date: date.toISOString().split("T")[0],
            value: parseFloat(valueToUse.toFixed(2)),
        })
    }

    const totalValue = portfolioHistory[portfolioHistory.length - 1].value
    const variation = {
        value: parseFloat(
            (
                totalValue -
                startValue -
                totalInvestedInPeriod +
                totalSoldInPeriod
            ).toFixed(2)
        ),
        percentage: parseFloat(
            (
                ((totalValue -
                    startValue -
                    totalInvestedInPeriod +
                    totalSoldInPeriod) /
                    (startValue + totalInvestedInPeriod - totalSoldInPeriod)) *
                100
            ).toFixed(2)
        ),
    }

    return {
        history: portfolioHistory,
        totalValue: parseFloat(totalValue.toFixed(2)),
        variation,
        startValue: parseFloat(startValue.toFixed(2)),
        totalInvestedInPeriod: parseFloat(totalInvestedInPeriod.toFixed(2)),
        totalSoldInPeriod: parseFloat(totalSoldInPeriod.toFixed(2)),
        totalPnLInPeriod: parseFloat(totalPnLInPeriod.toFixed(2)),
    }
}

function getStartDate(transactions, timeRange) {
    const now = new Date()
    switch (timeRange) {
        case "1M":
            return new Date(now.setMonth(now.getMonth() - 1))
        case "1Y":
            return new Date(now.setFullYear(now.getFullYear() - 1))
        case "ALL":
        default:
            const oldestDate = new Date(
                Math.min(...transactions.map((t) => new Date(t.date)))
            )
            oldestDate.setDate(oldestDate.getDate()) // Set to one day before the oldest transaction
            return oldestDate
    }
}

function calculatePortfolioValue(
    portfolio,
    assetPrices,
    date,
    lastKnownPrices
) {
    return Object.entries(portfolio).reduce((total, [symbol, shares]) => {
        const asset = assetPrices.find((a) => a.symbol === symbol)
        if (asset) {
            const price = findClosestPrice(asset.prices, date)
            return (
                total +
                shares * (price !== 0 ? price : lastKnownPrices[symbol] || 0)
            )
        }
        return total
    }, 0)
}

function findClosestPrice(prices, date) {
    const dateString = date.toISOString().split("T")[0]
    const pricesArray = Object.entries(prices).sort(
        (a, b) => new Date(b[0]) - new Date(a[0])
    )
    const closestPrice = pricesArray.find(
        ([priceDate]) => new Date(priceDate) <= date
    )
    return closestPrice ? parseFloat(closestPrice[1]) : 0
}
