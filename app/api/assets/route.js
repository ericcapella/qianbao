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
        const assetsCollection = db.collection("assets")
        const transactionsCollection = db.collection("transactions")

        const userTransactions = await transactionsCollection
            .find({ userEmail })
            .toArray()

        const userAssetSymbols = [
            ...new Set(userTransactions.map((t) => t.symbol)),
        ]

        const assets = await assetsCollection
            .find({ symbol: { $in: userAssetSymbols } })
            .toArray()

        const assetsWithTransactions = assets.map((asset) => {
            const assetTransactions = userTransactions.filter(
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
        const { symbol, date, amount, userEmail } = await request.json()
        const client = await clientPromise
        const db = client.db("stocktracker")
        const collection = db.collection("transactions")

        await collection.insertOne({ symbol, date, amount, userEmail })

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
