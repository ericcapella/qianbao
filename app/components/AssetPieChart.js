"use client"

import React, { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useSession } from "next-auth/react"
import { formatNumber } from "@/lib/utils"

export default function AssetPieChart() {
    const [chartData, setChartData] = useState([])
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchAssetData()
        }
    }, [status, session?.user?.email])

    const fetchAssetData = async () => {
        try {
            const response = await fetch(
                `/api/portfolios/total-value?userEmail=${encodeURIComponent(
                    session.user.email
                )}`
            )
            if (response.ok) {
                const data = await response.json()
                const totalValue = Object.values(data.assets).reduce(
                    (sum, asset) => sum + asset.value,
                    0
                )
                const assetData = Object.entries(data.assets).map(
                    ([symbol, asset]) => ({
                        symbol: symbol.replace(/\uFF0E/g, "."), // Unescape dots
                        value: asset.value,
                        percentage: (asset.value / totalValue) * 100,
                    })
                )
                setChartData(assetData)
            }
        } catch (error) {
            console.error("Error fetching asset data:", error)
        }
    }

    const colors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
        "hsl(var(--chart-6))",
    ]

    const chartConfig = {
        value: {
            label: "Value",
        },
        ...chartData.reduce((acc, curr, index) => {
            acc[curr.symbol] = {
                label: curr.symbol,
                color: colors[index % colors.length],
            }
            return acc
        }, {}),
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="rounded-lg bg-background p-2 shadow-md border border-border">
                    <p className="font-semibold">{data.symbol}</p>
                    <p>{`${formatNumber(data.value)} €`}</p>
                </div>
            )
        }
        return null
    }

    return (
        <ChartContainer
            className="w-full h-[250px] [&_.recharts-pie-label-text]:fill-foreground"
            config={chartConfig}
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <ChartTooltip content={<CustomTooltip />} />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="symbol"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        // paddingAngle={5}
                        label={({ symbol, percentage }) =>
                            `${symbol} ${percentage.toFixed(0)}%`
                        }
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={colors[index % colors.length]}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
