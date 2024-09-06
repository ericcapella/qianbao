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

        const portfolio = await portfoliosCollection.findOne({ userEmail })

        return NextResponse.json(
            portfolio
                ? {
                      assets: portfolio.assets,
                      lastRefreshed: portfolio.lastRefreshed,
                  }
                : { assets: [], lastRefreshed: null }
        )
    } catch (error) {
        console.error("Error fetching portfolio:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
