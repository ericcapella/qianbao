import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { fetchPricesFromAlphaVantage } from "@/app/api/assets/route"

export async function POST(request) {
    try {
        const { userEmail } = await request.json()
        const client = await clientPromise
        const db = client.db("stocktracker")
        const portfoliosCollection = db.collection("portfolios")
        const assetsCollection = db.collection("assets")

        // Get user's portfolio
        const portfolio = await portfoliosCollection.findOne({ userEmail })

        if (!portfolio) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: 404 }
            )
        }

        const now = new Date()
        const lastRefreshed = new Date(portfolio.lastRefreshed)
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        if (lastRefreshed > oneDayAgo) {
            return NextResponse.json({ message: "Portfolio is up to date" })
        }

        // Update prices for each asset
        for (const [symbol, asset] of Object.entries(portfolio.assets)) {
            const assetDoc = await assetsCollection.findOne({ symbol })

            if (!assetDoc) {
                console.error(`Asset ${symbol} not found in the database`)
                continue
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
                // Fetch new prices from Alpha Vantage
                const newPrices = await fetchPricesFromAlphaVantage(
                    symbol,
                    "DAILY",
                    latestPriceDate
                )

                // Merge new prices with existing prices
                const updatedPrices = { ...assetDoc.prices, ...newPrices }

                // Update asset document
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
        // Update portfolio's lastRefreshed date
        await portfoliosCollection.updateOne(
            { userEmail },
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
