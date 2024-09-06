"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("Attempting login...")
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        console.log("Login result:", result)

        if (result.ok) {
            console.log("Login successful, waiting for session...")
            // Wait for the session to be updated
            await new Promise((resolve) => setTimeout(resolve, 500))
            const session = await fetch("/api/auth/session")
            const sessionData = await session.json()
            console.log("Session after login:", sessionData)
            if (sessionData.user) {
                console.log("Session established, redirecting...")
                router.push("/dashboard")
            } else {
                console.error("Session not established after login")
                alert(
                    "Login successful, but session not established. Please try again."
                )
            }
        } else {
            console.error("Login failed:", result.error)
            alert("Login failed: " + result.error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded"
            >
                Login
            </button>
        </form>
    )
}
