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
import { fetchWithAuth } from "@/api-auth"

export default function AssetPieChart({ userId }) {
    const [data, setData] = useState([])

    useEffect(() => {
        if (userId) {
            fetchData()
        }
    }, [userId])

    const fetchData = async () => {
        try {
            const response = await fetchWithAuth(
                `/api/portfolios/total-value?userId=${encodeURIComponent(
                    userId
                )}`
            )
            const totalValue = Object.values(response.assets).reduce(
                (sum, asset) => sum + asset.value,
                0
            )
            const assetData = Object.entries(response.assets).map(
                ([symbol, asset]) => ({
                    symbol: symbol.replace(/\uFF0E/g, "."), // Unescape dots
                    value: asset.value,
                    percentage: (asset.value / totalValue) * 100,
                })
            )
            setData(assetData)
        } catch (error) {
            console.error("Error fetching data:", error)
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
        ...data.reduce((acc, curr, index) => {
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

    const chartContainerClass = `w-full h-[250px] [&_.recharts-pie-label-text]:fill-foreground ml-[-1rem] ${
        data.length > 4 ? "mt-20" : data.length > 2 ? "mt-12" : ""
    }`

    return (
        <ChartContainer className={chartContainerClass} config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <ChartTooltip content={<CustomTooltip />} />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="symbol"
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        label={({ symbol, percentage }) =>
                            `${symbol} ${percentage.toFixed(0)}%`
                        }
                        labelLine={false}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={200}
                        animationEasing="linear"
                    >
                        {data.map((entry, index) => (
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
