import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { fetchPricesFromAlphaVantage } from "@/app/api/assets/route"

export async function POST(request) {
    try {
        const { userId } = await request.json()
        const client = await clientPromise
        const db = client.db("qianbao")
        const portfoliosCollection = db.collection("portfolios")
        const assetsCollection = db.collection("assets")

        const portfolio = await portfoliosCollection.findOne({ userId })

        if (!portfolio) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: 404 }
            )
        }

        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        let needsRefresh = false

        // Check portfolio's last refresh date
        if (new Date(portfolio.lastRefreshed) < oneDayAgo) {
            needsRefresh = true
        }

        // Check each asset's last price date
        if (!needsRefresh) {
            for (const [symbol, asset] of Object.entries(portfolio.assets)) {
                const assetDoc = await assetsCollection.findOne({ symbol })
                if (assetDoc && assetDoc.prices) {
                    const latestPriceDate = new Date(
                        Math.max(
                            ...Object.keys(assetDoc.prices).map(
                                (date) => new Date(date)
                            )
                        )
                    )
                    if (latestPriceDate < oneDayAgo) {
                        needsRefresh = true
                        break
                    }
                }
            }
        }

        if (!needsRefresh) {
            return NextResponse.json({ message: "Portfolio is up to date" })
        }

        for (const [symbol, asset] of Object.entries(portfolio.assets)) {
            const assetDoc = await assetsCollection.findOne({ symbol })

            if (!assetDoc) {
                console.error(`Asset ${symbol} not found in the database`)
                continue
            }

            if (assetDoc.assetType === "custom") {
                continue // Skip custom assets
            }

            const latestPriceDate = new Date(
                Math.max(
                    ...Object.keys(assetDoc.prices).map(
                        (date) => new Date(date)
                    )
                )
            )
            const threeDaysAgo = new Date(
                now.getTime() - 3 * 24 * 60 * 60 * 1000
            )

            if (latestPriceDate < threeDaysAgo) {
                const newPrices = await fetchPricesFromAlphaVantage(
                    symbol,
                    "DAILY",
                    latestPriceDate,
                    assetDoc.assetType
                )

                const updatedPrices = { ...assetDoc.prices, ...newPrices }

                await assetsCollection.updateOne(
                    { symbol },
                    {
                        $set: {
                            prices: updatedPrices,
                            lastRefreshed: now,
                        },
                    }
                )
            }
        }

        await portfoliosCollection.updateOne(
            { userId },
            { $set: { lastRefreshed: now } }
        )

        return NextResponse.json({
            message: "Portfolio refreshed successfully",
        })
    } catch (error) {
        console.error("Error refreshing portfolio:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
