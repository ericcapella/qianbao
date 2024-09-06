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
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result.ok) {
            router.push("/")
        } else {
            alert("Login failed")
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
