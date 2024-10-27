"use client"

import { useState, useEffect, useRef } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const emailInputRef = useRef(null)
    const passwordInputRef = useRef(null)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const emailParam = params.get("email")
        if (emailParam) {
            setEmail(emailParam)
            passwordInputRef.current?.focus()
        } else {
            emailInputRef.current?.focus()
        }
    }, [])

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
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Link href="/" className="mb-8">
                <Image
                    src="/qianbao-logo.png"
                    alt="Qianbao Logo"
                    width={110}
                    height={22}
                />
            </Link>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                                ref={emailInputRef}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href={`mailto:info@wioks.com?subject=I forgot my QianBaopassword&body=My email is ${email}`}
                                    className="text-sm underline"
                                    tabIndex="-1"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                ref={passwordInputRef}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
