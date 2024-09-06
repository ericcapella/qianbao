import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    try {
        const { name, email, password } = await request.json()
        const hashedPassword = await hash(password, 10)

        const client = await clientPromise
        const usersCollection = client.db("stocktracker").collection("users")

        const existingUser = await usersCollection.findOne({ email })
        if (existingUser) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            )
        }

        await usersCollection.insertOne({
            name,
            email,
            password: hashedPassword,
        })

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error registering user:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
