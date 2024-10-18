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
                return {
                    symbol,
                    prices: asset ? asset.prices : null,
                    assetType: asset ? asset.assetType : "custom",
                }
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
    let activeAssets = {}

    // Only pre-calculate initial portfolio state for non-ALL time ranges
    if (timeRange !== "ALL") {
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

        startValue = calculatePortfolioValue(
            portfolio,
            assetPrices,
            startDate,
            lastKnownPrices,
            transactions
        )
        lastKnownValue = startValue

        // Initialize activeAssets with initial values
        Object.entries(portfolio).forEach(([symbol, shares]) => {
            if (shares > 0) {
                const asset = assetPrices.find((a) => a.symbol === symbol)
                if (asset && asset.prices) {
                    const price = findClosestPrice(asset.prices, startDate)
                    activeAssets[symbol] = {
                        shares,
                        initialValue: shares * price,
                    }
                } else {
                    const customAsset = transactions.find(
                        (t) => t.symbol === symbol && t.operation === "buy"
                    )
                    if (customAsset) {
                        activeAssets[symbol] = {
                            shares,
                            initialValue:
                                shares *
                                (customAsset.totalPaid / customAsset.shares),
                        }
                    }
                }
            }
        })
    }

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
                if (!activeAssets[t.symbol]) {
                    activeAssets[t.symbol] = {
                        shares: parseFloat(t.shares),
                        initialValue: parseFloat(t.totalPaid),
                    }
                } else {
                    activeAssets[t.symbol].shares += parseFloat(t.shares)
                    activeAssets[t.symbol].initialValue += parseFloat(
                        t.totalPaid
                    )
                }
            } else if (t.operation === "sell") {
                portfolio[t.symbol] -= parseFloat(t.shares)
                totalSoldInPeriod += parseFloat(t.totalReceived)
                totalPnLInPeriod += parseFloat(t.pnl || 0)
                if (activeAssets[t.symbol]) {
                    const sellRatio =
                        parseFloat(t.shares) / activeAssets[t.symbol].shares
                    activeAssets[t.symbol].shares -= parseFloat(t.shares)
                    activeAssets[t.symbol].initialValue *= 1 - sellRatio
                    if (activeAssets[t.symbol].shares <= 0) {
                        delete activeAssets[t.symbol]
                    }
                }
            }
        })

        const portfolioValue = calculatePortfolioValue(
            portfolio,
            assetPrices,
            date,
            lastKnownPrices,
            transactions
        )

        // Calculate portfolio distribution
        const distribution = Object.entries(portfolio).reduce(
            (acc, [symbol, shares]) => {
                const asset = assetPrices.find((a) => a.symbol === symbol)
                if (asset && asset.prices) {
                    const price = findClosestPrice(asset.prices, date)
                    const value =
                        shares *
                        (price !== 0 ? price : lastKnownPrices[symbol] || 0)
                    acc[symbol] = (value / portfolioValue) * 100
                } else {
                    // Handle custom assets
                    const customAsset = transactions.find(
                        (t) => t.symbol === symbol && t.operation === "buy"
                    )
                    if (customAsset) {
                        const value =
                            shares *
                            (customAsset.totalPaid / customAsset.shares)
                        acc[symbol] = (value / portfolioValue) * 100
                    }
                }
                return acc
            },
            {}
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

        // For ALL time range, set startValue to the first non-zero value
        if (timeRange === "ALL" && startValue === 0 && valueToUse !== 0) {
            startValue = valueToUse
            // Initialize activeAssets for ALL time range
            Object.entries(portfolio).forEach(([symbol, shares]) => {
                if (shares > 0) {
                    const asset = assetPrices.find((a) => a.symbol === symbol)
                    if (asset && asset.prices) {
                        const price = findClosestPrice(asset.prices, date)
                        activeAssets[symbol] = {
                            shares,
                            initialValue: shares * price,
                        }
                    } else {
                        // Handle custom assets
                        const customAsset = transactions.find(
                            (t) => t.symbol === symbol && t.operation === "buy"
                        )
                        if (customAsset) {
                            activeAssets[symbol] = {
                                shares,
                                initialValue:
                                    shares *
                                    (customAsset.totalPaid /
                                        customAsset.shares),
                            }
                        }
                    }
                }
            })
        }

        portfolioHistory.push({
            date: date.toISOString().split("T")[0],
            value: parseFloat(valueToUse.toFixed(2)),
            distribution: distribution,
            activeAssets: { ...activeAssets },
        })
    }

    const totalValue = portfolioHistory[portfolioHistory.length - 1].value
    const initialActiveValue = Object.values(activeAssets).reduce(
        (sum, asset) => sum + asset.initialValue,
        0
    )

    const variation = {
        value: parseFloat((totalValue - initialActiveValue).toFixed(2)),
        percentage: parseFloat(
            (
                ((totalValue - initialActiveValue) / initialActiveValue) *
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
    lastKnownPrices,
    transactions
) {
    return Object.entries(portfolio).reduce((total, [symbol, shares]) => {
        const asset = assetPrices.find((a) => a.symbol === symbol)

        if (asset && asset.prices) {
            const price = findClosestPrice(asset.prices, date)
            return (
                total +
                shares * (price !== 0 ? price : lastKnownPrices[symbol] || 0)
            )
        } else {
            // Handle custom assets
            const customAsset = transactions.find(
                (t) => t.symbol === symbol && t.operation === "buy"
            )
            if (customAsset) {
                return (
                    total +
                    shares * (customAsset.totalPaid / customAsset.shares)
                )
            }
            return total
        }
    }, 0)
}

function findClosestPrice(prices, date) {
    if (!prices) {
        return 0
    }

    const dateString = date.toISOString().split("T")[0]
    const pricesArray = Object.entries(prices).sort(
        (a, b) => new Date(b[0]) - new Date(a[0])
    )
    const closestPrice = pricesArray.find(
        ([priceDate]) => new Date(priceDate) <= date
    )
    return closestPrice ? parseFloat(closestPrice[1]) : 0
}
