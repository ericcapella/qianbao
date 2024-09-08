import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const userEmail = searchParams.get("userEmail")
        const timeRange = searchParams.get("timeRange")

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

        const { history, totalValue, variation } = calculatePortfolioHistory(
            transactions,
            assetPrices,
            timeRange
        )

        return NextResponse.json({ history, totalValue, variation })
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

    for (
        let date = startDate;
        date <= endDate;
        date.setDate(date.getDate() + 1)
    ) {
        const value = calculatePortfolioValue(transactions, assetPrices, date)
        portfolioHistory.push({
            date: date.toISOString().split("T")[0],
            value: parseFloat(value.toFixed(2)),
        })
    }

    const totalValue = portfolioHistory[portfolioHistory.length - 1].value
    const startValue = portfolioHistory[0].value
    const variation = {
        value: totalValue - startValue,
        percentage: ((totalValue - startValue) / startValue) * 100,
    }

    return { history: portfolioHistory, totalValue, variation }
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
            return new Date(transactions[0].date)
    }
}

function calculatePortfolioValue(transactions, assetPrices, date) {
    const portfolio = {}
    for (const transaction of transactions) {
        if (new Date(transaction.date) <= date) {
            if (!portfolio[transaction.symbol]) {
                portfolio[transaction.symbol] = 0
            }
            portfolio[transaction.symbol] += transaction.shares
        }
    }

    return Object.entries(portfolio).reduce((total, [symbol, shares]) => {
        const asset = assetPrices.find((a) => a.symbol === symbol)
        if (asset) {
            const price = findClosestPrice(asset.prices, date)
            return total + shares * price
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
