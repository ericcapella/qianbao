import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

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

        const portfolio = await portfoliosCollection.findOne({ userId })

        if (!portfolio) {
            return NextResponse.json({
                assets: [],
                lastRefreshed: null,
                oldestPriceDate: null,
            })
        }

        const assetSymbols = Object.keys(portfolio.assets)
        const assets = await assetsCollection
            .find({ symbol: { $in: assetSymbols } })
            .toArray()

        const oldestPriceDate = assets.reduce((oldest, asset) => {
            if (asset.prices) {
                const assetOldest = new Date(
                    Math.min(
                        ...Object.keys(asset.prices).map(
                            (date) => new Date(date)
                        )
                    )
                )
                return oldest
                    ? assetOldest < oldest
                        ? assetOldest
                        : oldest
                    : assetOldest
            }
            return oldest
        }, null)

        return NextResponse.json({
            assets: portfolio.assets,
            lastRefreshed: portfolio.lastRefreshed,
            oldestPriceDate: oldestPriceDate
                ? oldestPriceDate.toISOString()
                : null,
        })
    } catch (error) {
        console.error("Error fetching portfolio:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
