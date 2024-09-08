"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"

export default function TotalValueCard({ totalValue, variation }) {
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
