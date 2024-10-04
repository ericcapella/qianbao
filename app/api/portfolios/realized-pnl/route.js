import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
    console.log("API route called: /api/portfolios/realized-pnl")
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    console.log(
        "Received request for realized PnL data. User email:",
        userEmail
    )

    if (!userEmail) {
        console.error("User email is missing in the request")
        return NextResponse.json(
            { error: "User email is required" },
            { status: 400 }
        )
    }

    try {
        console.log("Connecting to database...")
        const client = await clientPromise
        const db = client.db("stocktracker")
        const transactionsCollection = db.collection("transactions")

        const pipeline = [
            { $match: { userEmail: userEmail } },
            {
                $group: {
                    _id: "$symbol",
                    totalPnL: {
                        $sum: {
                            $cond: [{ $eq: ["$operation", "sell"] }, "$pnl", 0],
                        },
                    },
                    oldestTransaction: { $min: "$date" },
                    lastSellTransaction: {
                        $max: {
                            $cond: [
                                { $eq: ["$operation", "sell"] },
                                "$date",
                                null,
                            ],
                        },
                    },
                    totalSharesSold: {
                        $sum: {
                            $cond: [
                                { $eq: ["$operation", "sell"] },
                                "$shares",
                                0,
                            ],
                        },
                    },
                    totalInvested: {
                        $sum: {
                            $cond: [
                                { $eq: ["$operation", "buy"] },
                                "$totalPaid",
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    symbol: "$_id",
                    pnl: "$totalPnL",
                    oldestTransaction: 1,
                    lastSellTransaction: 1,
                    totalSharesSold: 1,
                    totalInvested: 1,
                    roi: { $divide: ["$totalPnL", "$totalInvested"] },
                },
            },
        ]

        console.log("Executing aggregation pipeline...")
        const result = await transactionsCollection
            .aggregate(pipeline)
            .toArray()

        console.log("Aggregation result:", result)

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching realized PnL data:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        )
    }
}
