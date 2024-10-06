import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const userEmail = searchParams.get("userEmail")

        if (!userEmail) {
            return NextResponse.json(
                { error: "User email is required" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("stocktracker")
        const portfoliosCollection = db.collection("portfolios")
        const assetsCollection = db.collection("assets")

        const portfolio = await portfoliosCollection.findOne({ userEmail })

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
            if (assetData && assetData.prices) {
                const pricesArray = Object.entries(assetData.prices).sort(
                    (a, b) => new Date(b[0]) - new Date(a[0])
                )
                const latestPrice = parseFloat(pricesArray[0][1])
                const assetValue = asset.shares * latestPrice
                totalValue += assetValue
                assets[symbol] = {
                    shares: asset.shares,
                    value: assetValue,
                    paidPerShare: asset.paidPerShare,
                    currentPrice: latestPrice,
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
