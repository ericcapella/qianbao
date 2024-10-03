"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthButtons() {
    const { data: session } = useSession()

    if (session) {
        return (
            <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        )
    }

    return (
        <>
            <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/register">Register</Link>
            </Button>
        </>
    )
}
