import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    try {
        const { symbol } = await request.json()
        console.log(`Received request to add/update asset: ${symbol}`)

        const client = await clientPromise
        const db = client.db("stocktracker")
        const collection = db.collection("assets")

        // Check if the asset exists in the database
        const existingAsset = await collection.findOne({ symbol })

        if (existingAsset) {
            console.log(`Asset ${symbol} found in database`)
            const weeklyTimeSeries = existingAsset.data["Weekly Time Series"]
            const mostRecentDate = Object.keys(weeklyTimeSeries)[0]
            const lastRefreshed = new Date(mostRecentDate)
            const twoDaysAgo = new Date()
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

            if (lastRefreshed > twoDaysAgo) {
                console.log(
                    `Asset ${symbol} data is up to date. No need to fetch from Alpha Vantage.`
                )
                // Asset is up to date, return existing data
                return NextResponse.json(
                    { message: "Asset data is up to date" },
                    { status: 200 }
                )
            } else {
                console.log(
                    `Asset ${symbol} data is outdated. Fetching new data from Alpha Vantage.`
                )
            }
        } else {
            console.log(
                `Asset ${symbol} not found in database. Fetching data from Alpha Vantage.`
            )
        }

        // Fetch new data from Alpha Vantage
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY
        const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${apiKey}`

        console.log(`Fetching data from Alpha Vantage for ${symbol}`)
        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data["Error Message"]) {
            console.log(`Error from Alpha Vantage: ${data["Error Message"]}`)
            return NextResponse.json(
                { error: "Invalid symbol" },
                { status: 400 }
            )
        }

        // Update or insert the asset data
        await collection.updateOne(
            { symbol },
            {
                $set: {
                    symbol,
                    data,
                },
            },
            { upsert: true }
        )
        console.log(`Asset ${symbol} data updated in database`)

        return NextResponse.json(
            { message: "Asset data updated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error adding/updating asset:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const symbols = searchParams.get("symbols")

        if (!symbols) {
            return NextResponse.json(
                { error: "Symbols are required" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("stocktracker")
        const assetsCollection = db.collection("assets")

        const assets = await assetsCollection
            .find({ symbol: { $in: symbols.split(",") } })
            .toArray()

        return NextResponse.json(assets)
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
        const transactionsCollection = db.collection("transactions")
        const portfoliosCollection = db.collection("portfolios")

        await transactionsCollection.insertOne({
            symbol,
            date,
            amount,
            userEmail,
        })

        await portfoliosCollection.updateOne(
            { userEmail },
            {
                $inc: { [`assets.${symbol}`]: amount },
                $setOnInsert: { userEmail },
                $set: { lastRefreshed: new Date() },
            },
            { upsert: true }
        )

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
