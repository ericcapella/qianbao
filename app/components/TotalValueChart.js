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
    ReferenceDot,
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
import TotalValueCard from "./TotalValueCard"
import { formatNumber } from "@/lib/utils"

const CustomTooltip = ({
    active,
    payload,
    label,
    transactions,
    hoveredDot,
    portfolioDistribution,
    chartData,
}) => {
    if ((!active || !payload || !payload.length) && !hoveredDot) return null

    let date, value, transaction, distribution

    if (hoveredDot) {
        date = new Date(hoveredDot.date)
        // Find the corresponding chart data point for this date
        const chartDataPoint = chartData.find(
            (item) => new Date(item.date).toDateString() === date.toDateString()
        )
        value = chartDataPoint ? chartDataPoint.value : 0
        transaction = hoveredDot
    } else {
        date = new Date(label)
        value = payload[0].value
        transaction = transactions.find(
            (t) => new Date(t.date).toDateString() === date.toDateString()
        )
    }

    // Ensure the date is valid before calling toISOString()
    const dateKey =
        date instanceof Date && !isNaN(date)
            ? date.toISOString().split("T")[0]
            : null
    distribution = dateKey ? portfolioDistribution[dateKey] || {} : {}

    return (
        <div className="custom-tooltip bg-white p-4 border rounded-lg shadow-md">
            <p className="text-sm text-gray-600">
                {date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })}
            </p>
            <p className="font-bold">{`${formatNumber(value)} €`}</p>
            <div className="mt-2 border-t pt-2">
                {Object.entries(distribution)
                    .filter(([_, percentage]) => percentage !== 0)
                    .map(([symbol, percentage]) => (
                        <p key={symbol} className="text-sm">
                            {percentage ? percentage.toFixed(0) : "0"}%{" "}
                            {symbol.replace(/\uFF0E/g, ".")}
                        </p>
                    ))}
            </div>
            {transaction && (
                <div className="mt-2 border-t pt-2">
                    <p className="text-sm font-bold">
                        {transaction.operation.charAt(0).toUpperCase() +
                            transaction.operation.slice(1)}{" "}
                        transaction
                    </p>
                    <p className="text-sm">
                        {transaction.symbol.replace(/\uFF0E/g, ".")} (
                        {typeof transaction.shares === "number"
                            ? transaction.shares.toFixed(6)
                            : "N/A"}{" "}
                        shares)
                    </p>
                    <p className="text-sm">
                        {formatNumber(
                            transaction.operation === "buy"
                                ? transaction.totalPaid
                                : transaction.totalReceived
                        )}{" "}
                        €{" "}
                        {transaction.operation === "buy" ? "paid" : "received"}
                    </p>
                    {transaction.operation === "sell" && (
                        <p className="text-sm">
                            <span
                                className={
                                    transaction.pnl >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }
                            >
                                {formatNumber(transaction.pnl)} €
                            </span>{" "}
                            <span
                                className={
                                    transaction.pnl >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }
                            >
                                {transaction.pnl >= 0 ? "profit" : "loss"}
                            </span>
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default function TotalValueChart() {
    const [chartData, setChartData] = useState([])
    const [timeRange, setTimeRange] = useState("1Y")
    const [totalValue, setTotalValue] = useState(0)
    const [variation, setVariation] = useState({ percentage: 0, value: 0 })
    const [startValue, setStartValue] = useState(0)
    const [totalInvestedInPeriod, setTotalInvestedInPeriod] = useState(0)
    const [totalPnLInPeriod, setTotalPnLInPeriod] = useState(0)
    const [transactions, setTransactions] = useState([]) // New state for transactions
    const [hoveredDot, setHoveredDot] = useState(null)
    const [portfolioDistribution, setPortfolioDistribution] = useState({})
    const [combinedProgression, setCombinedProgression] = useState(0)
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
                )}&timeRange=${timeRange}&includeTransactions=true`
            )
            if (response.ok) {
                const data = await response.json()
                console.log("Received data from API:", data)
                setChartData(data.history)
                setTotalValue(data.totalValue)
                setVariation(data.variation)
                setStartValue(data.startValue)
                setTotalInvestedInPeriod(data.totalInvestedInPeriod)
                setTotalPnLInPeriod(data.totalPnLInPeriod)
                setTransactions(data.transactions)
                setPortfolioDistribution(
                    data.history.reduce((acc, item) => {
                        acc[item.date] = item.distribution
                        return acc
                    }, {})
                )
                console.log("Set transactions:", data.transactions)

                // Calculate and set the combined progression
                const combinedValue =
                    data.variation.value + data.totalPnLInPeriod
                setCombinedProgression(combinedValue)
            }
        } catch (error) {
            console.error("Error fetching chart data:", error)
        }
    }

    const isPositiveProgression = combinedProgression > 0
    const chartColor = isPositiveProgression ? "#5AC87C" : "#EF5343"

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem)
        switch (timeRange) {
            case "1M":
                const mondayDate = new Date(
                    date.setDate(date.getDate() - date.getDay() + 1)
                )
                return `Week ${mondayDate.getDate()} ${date.toLocaleString(
                    "default",
                    { month: "short" }
                )}`
            case "1Y":
            case "ALL":
                return date.toLocaleString("en-US", {
                    month: "short",
                    year: "2-digit",
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

    const calculateYAxisMinimum = () => {
        if (chartData.length === 0) return 0
        const minValue = Math.min(...chartData.map((item) => item.value))
        return Math.floor(minValue * 0.99)
    }

    return (
        <Card>
            <CardHeader className="flex flex-col space-y-0 py-5 shadow-0">
                <div className="flex flex-row sm:flex-row items-start sm:items-center justify-between gap-4 border-0">
                    <TotalValueCard
                        totalValue={totalValue}
                        variation={variation}
                        totalInvestedInPeriod={totalInvestedInPeriod}
                        totalPnLInPeriod={totalPnLInPeriod}
                    />
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="w-[160px] rounded-lg"
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
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:pt-6">
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient
                                id="colorValue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
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
                            style={{ fontSize: "0.8rem" }}
                            angle={window.innerWidth <= 640 ? -45 : 0}
                            textAnchor={
                                window.innerWidth <= 640 ? "end" : "middle"
                            }
                            height={window.innerWidth <= 640 ? 50 : 30}
                        />
                        <YAxis
                            axisLine={true}
                            tickLine={true}
                            domain={[calculateYAxisMinimum(), "dataMax"]}
                            tickFormatter={(value) => `${value.toFixed(0)} €`}
                            style={{ fontSize: "0.8rem" }}
                        />
                        <Tooltip
                            content={
                                <CustomTooltip
                                    transactions={transactions}
                                    hoveredDot={hoveredDot}
                                    portfolioDistribution={
                                        portfolioDistribution
                                    }
                                    chartData={chartData}
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={chartColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            baseValue={calculateYAxisMinimum()}
                        />
                        {transactions.map((transaction, index) => (
                            <ReferenceDot
                                key={index}
                                x={transaction.date}
                                y={calculateYAxisMinimum()}
                                r={7}
                                fill={
                                    transaction.operation === "buy"
                                        ? "#5AC87C"
                                        : "#EF5343"
                                }
                                stroke="none"
                                onMouseEnter={() => setHoveredDot(transaction)}
                                onMouseLeave={() => setHoveredDot(null)}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
