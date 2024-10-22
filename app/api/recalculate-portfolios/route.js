import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    try {
        const client = await clientPromise
        const db = client.db("qianbao")
        const transactionsCollection = db.collection("transactions")
        const portfoliosCollection = db.collection("portfolios")

        // Get all unique userIds
        const uniqueUsers = await transactionsCollection.distinct("userId")

        for (const userId of uniqueUsers) {
            // Calculate total shares and total paid for each symbol for the user
            const userPortfolio = await transactionsCollection
                .aggregate([
                    { $match: { userId } },
                    {
                        $group: {
                            _id: "$symbol",
                            totalShares: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$operation", "buy"] },
                                        "$shares",
                                        { $multiply: ["$shares", -1] },
                                    ],
                                },
                            },
                            totalPaid: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$operation", "buy"] },
                                        "$totalPaid",
                                        { $multiply: ["$totalReceived", -1] },
                                    ],
                                },
                            },
                        },
                    },
                ])
                .toArray()

            // Convert the array to an object with the new structure
            const assets = userPortfolio.reduce(
                (acc, { _id, totalShares, totalPaid }) => {
                    if (totalShares > 0) {
                        acc[_id] = {
                            shares: totalShares,
                            totalPaid,
                            paidPerShare: totalPaid / totalShares,
                        }
                    }
                    return acc
                },
                {}
            )

            // Update or insert the portfolio entry
            await portfoliosCollection.updateOne(
                { userId },
                {
                    $set: {
                        assets,
                        lastRefreshed: new Date(),
                    },
                },
                { upsert: true }
            )
        }

        return NextResponse.json({
            message: "Portfolios recalculated successfully",
        })
    } catch (error) {
        console.error("Error recalculating portfolios:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
