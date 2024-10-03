"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"

export default function TotalValueCard({
    totalValue,
    variation,
    totalInvestedInPeriod,
    totalPnLInPeriod,
}) {
    const isPositive = variation.percentage >= 0
    const textColor = isPositive ? "text-green-500" : "text-red-500"

    return (
        <Card className="w-full md:w-6/12 border-0 shadow-none">
            <CardContent className="flex flex-col sm:flex-row justify-between p-0 gap-6">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">
                        Total Portfolio
                    </span>
                    <span className="text-2xl font-bold">
                        {formatNumber(totalValue)}€
                    </span>
                    <span className={`text-xs ${textColor}`}>
                        {formatNumber(Math.abs(variation.value))}€{" "}
                        {isPositive ? "▲" : "▼"}
                        {Math.abs(variation.percentage).toFixed(2)}%
                    </span>
                </div>
                <div className="flex flex-col items-start justify-start">
                    <span className="text-sm font-medium text-muted-foreground">
                        Total Invested
                    </span>
                    <span className="text-2xl font-bold">
                        {formatNumber(totalInvestedInPeriod)}€
                    </span>
                </div>
                <div className="flex flex-col items-start justify-start">
                    <span className="text-sm font-medium text-muted-foreground">
                        Realized PnL
                    </span>
                    <span
                        className={`text-2xl font-bold ${
                            totalPnLInPeriod >= 0
                                ? "text-green-500"
                                : "text-red-500"
                        }`}
                    >
                        {formatNumber(totalPnLInPeriod)}€
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
