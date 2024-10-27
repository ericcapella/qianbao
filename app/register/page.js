"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const nameInputRef = useRef(null)

    useEffect(() => {
        nameInputRef.current?.focus()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        })

        if (response.ok) {
            router.push(`/login?email=${encodeURIComponent(email)}`)
        } else {
            const data = await response.json()
            alert(data.error || "Registration failed")
        }
    }

    return (
        <div className="flex flex-col-reverse lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-[800px]">
                    <div className="flex flex-col items-center mb-8 hidden lg:flex">
                        <Link href="/">
                            <Image
                                src="/qianbao-logo.png"
                                alt="Qianbao Logo"
                                width={110}
                                height={22}
                            />
                        </Link>
                        <h2 className="text-2xl font-bold mt-4 text-center">
                            Simple and privacy-first investment portfolio
                            tracker
                        </h2>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center justify-between mb-8 space-y-4 lg:space-y-0">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                ></path>
                            </svg>
                            <span>Securely encrypted</span>
                        </div>
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                ></path>
                            </svg>
                            <span>Stocks, ETFs, Crypto and more</span>
                        </div>
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                ></path>
                            </svg>
                            <span>Easy to set up</span>
                        </div>
                    </div>
                    <div className="rounded-xl overflow-hidden relative mx-[-1rem]">
                        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10"></div>
                        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10"></div>
                        <img
                            src="/chart-screenshot.png"
                            alt="Portfolio Chart"
                            className="w-full"
                        />
                    </div>
                    <div className="hidden lg:grid grid-cols-2 gap-8 mt-8">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-muted rounded-lg mr-4 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold">
                                All your investments in one place
                            </h3>
                        </div>
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-muted rounded-lg mr-4 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold">
                                Real-time net worth tracking
                            </h3>
                        </div>
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-muted rounded-lg mr-4 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold">
                                Maximum data protection
                            </h3>
                        </div>
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-muted rounded-lg mr-4 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold">
                                Effortless performance tracking
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Register</h1>
                        <p className="text-balance text-muted-foreground">
                            Create an account to start tracking your portfolio
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Warren Buffett"
                                required
                                ref={nameInputRef}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Register
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
