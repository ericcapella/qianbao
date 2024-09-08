"use client"

import React, { useState, useEffect } from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSession } from "next-auth/react"

export default function TotalValueChart() {
    const [chartData, setChartData] = useState([])
    const [timeRange, setTimeRange] = useState("1Y")
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchChartData()
        }
    }, [status, session?.user?.email, timeRange])

    const fetchChartData = async () => {
        try {
            const response = await fetch(
                `/api/portfolios/value-history?userEmail=${encodeURIComponent(
                    session.user.email
                )}&timeRange=${timeRange}`
            )
            if (response.ok) {
                const data = await response.json()
                setChartData(data)
            }
        } catch (error) {
            console.error("Error fetching chart data:", error)
        }
    }

    const isPositiveProgression =
        chartData.length > 1 &&
        chartData[chartData.length - 1].value > chartData[0].value
    const chartColor = isPositiveProgression ? "#5AC87C" : "#EF5343"

    console.log("progession", isPositiveProgression)
    console.log("chartColor", chartColor)

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem)
        switch (timeRange) {
            case "1M":
                return `Week ${getWeekNumber(date)} ${date.toLocaleString(
                    "default",
                    { month: "short" }
                )}`
            case "1Y":
            case "ALL":
                return date.toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                })
            default:
                return tickItem
        }
    }

    const getWeekNumber = (date) => {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        return Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7)
    }

    const getTickInterval = () => {
        switch (timeRange) {
            case "1M":
                return 7
            case "1Y":
            case "ALL":
                return 30
            default:
                return "preserveStartEnd"
        }
    }

    return (
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Portfolio Value Over Time</CardTitle>
                    <CardDescription>
                        Showing portfolio value evolution
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
                        aria-label="Select time range"
                    >
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="1M" className="rounded-lg">
                            Last month
                        </SelectItem>
                        <SelectItem value="1Y" className="rounded-lg">
                            Last year
                        </SelectItem>
                        <SelectItem value="ALL" className="rounded-lg">
                            All time
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient
                                id="colorValue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="0.75"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={chartColor}
                                    stopOpacity={0.6}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={chartColor}
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} horizontal={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxis}
                            interval={getTickInterval()}
                            axisLine={true}
                            tickLine={true}
                        />
                        <YAxis axisLine={true} tickLine={true} />
                        <Tooltip
                            contentStyle={{ borderRadius: "8px" }}
                            formatter={(value) => [`${value.toFixed(2)} €`, ""]}
                            labelFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })
                            }
                            labelStyle={{ color: "#666", fontSize: "12px" }}
                            separator=""
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={chartColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
