"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function Home() {
    const { data: session, status } = useSession()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status !== "loading") {
            setIsLoading(false)
        }
    }, [status])

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">
                Welcome to Stock Asset Tracker
            </h1>
            {session ? (
                <Link
                    href="/dashboard"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Go to Dashboard
                </Link>
            ) : (
                <div className="space-x-4">
                    <Link
                        href="/register"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Register
                    </Link>
                    <Link
                        href="/login"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Login
                    </Link>
                </div>
            )}
        </main>
    )
}
