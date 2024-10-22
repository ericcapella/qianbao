import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

function calculateAnnualizedROI(transactions, currentValue, currentShares) {
    let totalInvested = 0
    let totalShares = 0
    const now = new Date()

    transactions.forEach((transaction) => {
        if (transaction.operation === "buy") {
            const daysHeld =
                (now - new Date(transaction.date)) / (1000 * 60 * 60 * 24)
            totalInvested += transaction.totalPaid
            totalShares += transaction.shares
        }
    })

    if (totalInvested === 0 || currentShares === 0) {
        return 0
    }

    // Calculate the average cost per share
    const averageCostPerShare = totalInvested / totalShares

    // Calculate the invested amount for current shares
    const investedForCurrentShares = averageCostPerShare * currentShares

    const profitLoss = currentValue - investedForCurrentShares

    const totalReturn = profitLoss / investedForCurrentShares

    // Use the date of the first buy transaction for calculation
    const firstBuyDate = new Date(
        transactions.find((t) => t.operation === "buy").date
    )
    const daysHeld = (now - firstBuyDate) / (1000 * 60 * 60 * 24)

    const annualizedROI = (Math.pow(1 + totalReturn, 365 / daysHeld) - 1) * 100

    return annualizedROI
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("stocktracker")
        const portfoliosCollection = db.collection("portfolios")
        const assetsCollection = db.collection("assets")
        const transactionsCollection = db.collection("transactions")

        const portfolio = await portfoliosCollection.findOne({ userId })

        if (!portfolio || !portfolio.assets) {
            return NextResponse.json({
                totalValue: 0,
                variation: { percentage: 0, value: 0 },
            })
        }

        let totalValue = 0
        let totalValueThirtyDaysAgo = 0
        const assets = {}

        for (const [symbol, asset] of Object.entries(portfolio.assets)) {
            const assetData = await assetsCollection.findOne({ symbol })
            const transactions = await transactionsCollection
                .find({ userId, symbol })
                .toArray()

            if (assetData && assetData.prices) {
                const pricesArray = Object.entries(assetData.prices).sort(
                    (a, b) => new Date(b[0]) - new Date(a[0])
                )
                const latestPrice = parseFloat(pricesArray[0][1])
                const lastPriceDate = pricesArray[0][0]
                const assetValue = asset.shares * latestPrice
                totalValue += assetValue

                const annualizedROI = calculateAnnualizedROI(
                    transactions,
                    assetValue,
                    asset.shares
                )

                assets[symbol] = {
                    shares: asset.shares,
                    value: assetValue,
                    paidPerShare: asset.paidPerShare,
                    currentPrice: latestPrice,
                    assetType: assetData.assetType,
                    lastPriceDate: lastPriceDate,
                    annualizedROI: annualizedROI,
                }

                // Calculate value 30 days ago
                const thirtyDaysAgoIndex = pricesArray.findIndex(([date]) => {
                    const priceDate = new Date(date)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return priceDate <= thirtyDaysAgo
                })

                const priceThirtyDaysAgo =
                    thirtyDaysAgoIndex !== -1
                        ? parseFloat(pricesArray[thirtyDaysAgoIndex][1])
                        : latestPrice

                totalValueThirtyDaysAgo += asset.shares * priceThirtyDaysAgo
            } else {
                // Handle custom assets
                const assetValue = asset.shares * asset.paidPerShare
                totalValue += assetValue
                totalValueThirtyDaysAgo += assetValue
                assets[symbol] = {
                    shares: asset.shares,
                    value: assetValue,
                    paidPerShare: asset.paidPerShare,
                    currentPrice: asset.paidPerShare,
                    assetType: "custom",
                    lastPriceDate: new Date().toISOString().split("T")[0],
                }
            }
        }

        const variation = {
            value: totalValue - totalValueThirtyDaysAgo,
            percentage:
                ((totalValue - totalValueThirtyDaysAgo) /
                    totalValueThirtyDaysAgo) *
                100,
        }

        return NextResponse.json({ totalValue, variation, assets })
    } catch (error) {
        console.error("Error calculating total value:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
