import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    try {
        const { symbol } = await request.json()
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY
        const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${apiKey}`

        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data["Error Message"]) {
            return NextResponse.json(
                { error: "Invalid symbol" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("stocktracker")
        const collection = db.collection("assets")

        await collection.updateOne(
            { symbol },
            { $set: { symbol, data } },
            { upsert: true }
        )

        return NextResponse.json(
            { message: "Asset added successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error adding asset:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db("stocktracker")
        const assetsCollection = db.collection("assets")
        const transactionsCollection = db.collection("transactions")

        const assets = await assetsCollection.find({}).toArray()
        const transactions = await transactionsCollection.find({}).toArray()

        const assetsWithTransactions = assets.map((asset) => {
            const assetTransactions = transactions.filter(
                (t) => t.symbol === asset.symbol
            )
            const totalAmount = assetTransactions.reduce(
                (sum, t) => sum + t.amount,
                0
            )
            return { ...asset, totalAmount }
        })

        return NextResponse.json(assetsWithTransactions)
    } catch (error) {
        console.error("Error fetching assets:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function PUT(request) {
    try {
        const { symbol, date, amount } = await request.json()
        const client = await clientPromise
        const db = client.db("stocktracker")
        const collection = db.collection("transactions")

        await collection.insertOne({ symbol, date, amount })

        return NextResponse.json(
            { message: "Transaction added successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error adding transaction:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
