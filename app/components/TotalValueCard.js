"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"

export default function TotalValueCard() {
    const [totalValue, setTotalValue] = useState(0)
    const [variation, setVariation] = useState({ percentage: 0, value: 0 })
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchTotalValue()
        }
    }, [status, session?.user?.email])

    const fetchTotalValue = async () => {
        try {
            const response = await fetch(
                `/api/portfolios/total-value?userEmail=${encodeURIComponent(
                    session.user.email
                )}`
            )
            if (response.ok) {
                const data = await response.json()
                setTotalValue(data.totalValue)
                setVariation(data.variation)
            }
        } catch (error) {
            console.error("Error fetching total value:", error)
        }
    }
    return (
        <div className="flex-1">
            <div className="text-2xl font-bold">{totalValue.toFixed(2)} €</div>
            <div
                className={`text-sm ${
                    variation.percentage >= 0
                        ? "text-green-500"
                        : "text-red-500"
                }`}
            >
                €{Math.abs(variation.value).toFixed(2)}
                {variation.percentage >= 0 ? "▲" : "▼"}
                {Math.abs(variation.percentage).toFixed(2)}%
            </div>
        </div>
    )
}
