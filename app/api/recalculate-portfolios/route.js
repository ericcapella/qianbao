import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    try {
        const client = await clientPromise
        const db = client.db("stocktracker")
        const transactionsCollection = db.collection("transactions")
        const portfoliosCollection = db.collection("portfolios")

        // Get all unique userEmails
        const uniqueUsers = await transactionsCollection.distinct("userEmail")

        for (const userEmail of uniqueUsers) {
            // Calculate total amount for each symbol for the user
            const userPortfolio = await transactionsCollection
                .aggregate([
                    { $match: { userEmail } },
                    {
                        $group: {
                            _id: "$symbol",
                            totalAmount: { $sum: "$amount" },
                        },
                    },
                ])
                .toArray()

            // Convert the array to an object with escaped symbols
            const assets = userPortfolio.reduce((acc, { _id, totalAmount }) => {
                acc[_id] = totalAmount
                return acc
            }, {})

            // Update or insert the portfolio entry
            await portfoliosCollection.updateOne(
                { userEmail },
                {
                    $set: {
                        assets,
                        lastRefreshed: new Date(),
                    },
                },
                { upsert: true }
            )
        }

        return NextResponse.json(
            { message: "Portfolios recalculated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error recalculating portfolios:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
