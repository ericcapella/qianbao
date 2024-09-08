"use client"

import React, { useMemo, useState, useEffect } from "react"
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useSession } from "next-auth/react"

export default function AssetPieChart() {
    const [chartData, setChartData] = useState([])
    const [totalValue, setTotalValue] = useState(0)
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
                const assetData = Object.entries(data.assets).map(
                    ([symbol, asset]) => ({
                        symbol,
                        value: asset.value,
                    })
                )
                setChartData(assetData)
                setTotalValue(data.totalValue)
            }
        } catch (error) {
            console.error("Error fetching asset data:", error)
        }
    }

    const colors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
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

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Asset Portfolio</CardTitle>
                <CardDescription>Current Distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    className="w-full h-[250px]"
                    config={chartConfig}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip
                                content={({ payload }) => {
                                    if (payload && payload.length) {
                                        const data = payload[0].payload
                                        return (
                                            <div className="rounded-lg bg-white p-2 shadow-md">
                                                <div className="font-bold">
                                                    {data.symbol}
                                                </div>
                                                <div>{`${data.value.toFixed(
                                                    2
                                                )}€`}</div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="symbol"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
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
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Portfolio Overview
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing current asset distribution
                </div>
            </CardFooter>
        </Card>
    )
}
