import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
    console.log("entered in fetchTransactions")
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
        return NextResponse.json(
            { error: "User email is required" },
            { status: 400 }
        )
    }

    try {
        const client = await clientPromise
        const db = client.db("stocktracker")
        const transactions = await db
            .collection("transactions")
            .find({ userEmail })
            .sort({ date: -1 })
            .toArray()

        const formattedTransactions = transactions.map((t) => ({
            ...t,
            pnl: t.operation === "sell" ? t.pnl : undefined,
        }))

        console.log(
            `Found ${formattedTransactions.length} transactions for ${userEmail}`
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
