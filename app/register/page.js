"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        })

        if (response.ok) {
            router.push("/login")
        } else {
            const data = await response.json()
            alert(data.error || "Registration failed")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="w-full p-2 mb-4 border rounded"
            />
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
                Register
            </button>
        </form>
    )
}
