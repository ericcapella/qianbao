"use client"

import { useState, useEffect } from "react"
import { formatNumber } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { CalendarIcon } from "@radix-ui/react-icons"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const month = d.toLocaleString("default", { month: "short" })
    const day = d.getDate()
    const year = d.getFullYear()
    return `${month} ${day}, ${year}`
}

export default function TransactionList() {
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [assets, setAssets] = useState([])
    const [selectedAsset, setSelectedAsset] = useState(null)
    const [dateRange, setDateRange] = useState({ from: null, to: null })
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchTransactions()
        }
    }, [status, session?.user?.email])

    const fetchTransactions = async () => {
        try {
            const response = await fetch(
                `/api/transactions?userEmail=${encodeURIComponent(
                    session.user.email
                )}`
            )
            if (response.ok) {
                const data = await response.json()
                setTransactions(data)
                setFilteredTransactions(data)
                const uniqueAssets = [...new Set(data.map((t) => t.symbol))]
                setAssets(uniqueAssets)
            }
        } catch (error) {
            console.error("Error fetching transactions:", error)
        }
    }

    const applyFilters = () => {
        let filtered = transactions
        if (selectedAsset) {
            filtered = filtered.filter((t) => t.symbol === selectedAsset)
        }
        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter((t) => {
                const transactionDate = new Date(t.date)
                return (
                    transactionDate >= new Date(dateRange.from) &&
                    transactionDate <= new Date(dateRange.to)
                )
            })
        }
        setFilteredTransactions(filtered)
    }

    useEffect(() => {
        applyFilters()
    }, [selectedAsset, dateRange, transactions])

    const getOperationColor = (operation) => {
        if (!operation) return "#EF5343" // Default to red (buy color) if operation is undefined
        return operation.toLowerCase() === "buy" ? "#EF5343" : "#5AC87C"
    }

    return (
        <Card className="my-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <CardTitle>Transaction History</CardTitle>
                </div>
                <div className="flex space-x-2">
                    {(selectedAsset || dateRange.from || dateRange.to) && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedAsset(null)
                                setDateRange({ from: null, to: null })
                            }}
                            className="ml-2"
                        >
                            Clear Filters
                        </Button>
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-[300px] justify-start text-left font-normal ${
                                    !dateRange.from &&
                                    !dateRange.to &&
                                    "text-muted-foreground"
                                }`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {formatDate(dateRange.from)} -{" "}
                                            {formatDate(dateRange.to)}
                                        </>
                                    ) : (
                                        formatDate(dateRange.from)
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <Select
                        value={selectedAsset}
                        onValueChange={setSelectedAsset}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>All assets</SelectItem>
                            {assets.map((asset) => (
                                <SelectItem key={asset} value={asset}>
                                    {asset}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Operation</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">
                                Quantity
                            </TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                                <TableCell
                                    style={{
                                        color: getOperationColor(
                                            transaction.operation
                                        ),
                                    }}
                                >
                                    {transaction.operation || "Buy"}
                                </TableCell>
                                <TableCell>
                                    {transaction.symbol.toUpperCase()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNumber(
                                        transaction.totalPaid /
                                            transaction.shares
                                    )}{" "}
                                    €
                                </TableCell>
                                <TableCell className="text-right">
                                    {transaction.shares}
                                </TableCell>
                                <TableCell
                                    className="text-right"
                                    style={{
                                        color: getOperationColor(
                                            transaction.operation
                                        ),
                                    }}
                                >
                                    {formatNumber(transaction.totalPaid)} €
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatDate(transaction.date)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
