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
        const collection = db.collection("assets")

        const assets = await collection.find({}).toArray()

        return NextResponse.json(assets)
    } catch (error) {
        console.error("Error fetching assets:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
