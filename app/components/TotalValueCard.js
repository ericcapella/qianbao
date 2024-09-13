"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { formatNumber } from "@/lib/utils"

export default function TotalValueCard({
    totalValue,
    variation,
    startValue,
    totalInvestedInPeriod,
}) {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (status === "unauthenticated") {
        return null
    }

    return (
        <div className="flex flex-col">
            <CardTitle className="text-2xl font-bold">
                {formatNumber(totalValue)}€
            </CardTitle>
            <div
                className={`text-sm font-medium ${
                    variation.percentage >= 0
                        ? "text-green-500"
                        : "text-red-500"
                }`}
            >
                {formatNumber(Math.abs(variation.value))}€
                {variation.percentage >= 0 ? "▲" : "▼"}
                {Math.abs(variation.percentage).toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500">
                {formatNumber(totalInvestedInPeriod)}€ invested
            </div>
        </div>
    )
}
