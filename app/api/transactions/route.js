import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
    console.log("entered in fetchTransactions")
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
        return NextResponse.json(
            { error: "User ID is required" },
            { status: 400 }
        )
    }

    try {
        const client = await clientPromise
        const db = client.db("qianbao")
        const transactions = await db
            .collection("transactions")
            .find({ userId })
            .sort({ date: -1 })
            .toArray()

        const formattedTransactions = transactions.map((t) => ({
            ...t,
            pnl: t.operation === "sell" ? t.pnl : undefined,
        }))

        console.log(
            `Found ${formattedTransactions.length} transactions for user ${userId}`
        )
        return NextResponse.json(formattedTransactions)
    } catch (error) {
        console.error("Error fetching transactions:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        )
    }
}
