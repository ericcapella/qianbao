import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
        console.error("User email is missing in the request")
        return NextResponse.json(
            { error: "User email is required" },
            { status: 400 }
        )
    }

    try {
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
                    annualizedReturn: {
                        $let: {
                            vars: {
                                daysDiff: {
                                    $divide: [
                                        {
                                            $subtract: [
                                                new Date(),
                                                {
                                                    $toDate:
                                                        "$oldestTransaction",
                                                },
                                            ],
                                        },
                                        1000 * 60 * 60 * 24,
                                    ],
                                },
                            },
                            in: {
                                $cond: [
                                    {
                                        $or: [
                                            { $eq: ["$$daysDiff", 0] },
                                            { $eq: ["$totalInvested", 0] },
                                        ],
                                    },
                                    0,
                                    {
                                        $subtract: [
                                            {
                                                $pow: [
                                                    {
                                                        $add: [
                                                            1,
                                                            {
                                                                $divide: [
                                                                    "$totalPnL",
                                                                    "$totalInvested",
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        $divide: [
                                                            365,
                                                            "$$daysDiff",
                                                        ],
                                                    },
                                                ],
                                            },
                                            1,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        ]

        const result = await transactionsCollection
            .aggregate(pipeline)
            .toArray()

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching realized PnL data:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        )
    }
}
