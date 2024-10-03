import { NextResponse } from "next/server"

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const keywords = searchParams.get("keywords")

    console.log("API received keywords:", keywords)

    if (!keywords) {
        return NextResponse.json(
            { error: "Keywords are required" },
            { status: 400 }
        )
    }

    const apiUrl = `https://ticker-2e1ica8b9.now.sh/keyword/${encodeURIComponent(
        keywords
    )}`

    try {
        const response = await fetch(apiUrl)
        const data = await response.json()

        console.log("API received data:", data)

        if (Array.isArray(data) && data.length > 0) {
            console.log("API returning results:", data)
            return NextResponse.json(data)
        } else {
            console.log("API returning empty array")
            return NextResponse.json([])
        }
    } catch (error) {
        console.error("Error fetching symbol suggestions:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
