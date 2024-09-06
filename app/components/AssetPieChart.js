"use client"

import React, { useMemo } from "react"
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

export default function AssetPieChart({ assets }) {
    const chartData = useMemo(() => {
        return Object.entries(assets).map(([symbol, asset]) => ({
            symbol,
            value: asset.totalAmount,
        }))
    }, [assets])

    const totalValue = useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0)
    }, [chartData])

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
                                label
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                    />
                                ))}
                            </Pie>
                            <Label
                                content={({ viewBox }) => {
                                    const { cx, cy } = viewBox
                                    return (
                                        <text
                                            x={cx}
                                            y={cy}
                                            fill="#333"
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                        >
                                            <tspan
                                                x={cx}
                                                y={cy}
                                                dy="-0.5em"
                                                fontSize="24"
                                                fontWeight="bold"
                                            >
                                                {totalValue.toLocaleString(
                                                    undefined,
                                                    { maximumFractionDigits: 2 }
                                                )}
                                                €
                                            </tspan>
                                            <tspan
                                                x={cx}
                                                y={cy}
                                                dy="1.5em"
                                                fontSize="14"
                                            >
                                                Total Value
                                            </tspan>
                                        </text>
                                    )
                                }}
                                position="center"
                            />
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
