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
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
}

const getUniqueYears = (transactions) => {
    const years = transactions.map((t) => new Date(t.date).getFullYear())
    return [...new Set(years)].sort((a, b) => a - b) // Sort in ascending order
}

export default function TransactionList({ transactions }) {
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [assets, setAssets] = useState([])
    const [selectedAsset, setSelectedAsset] = useState(null)
    const [dateRange, setDateRange] = useState({ from: null, to: null })
    const { data: session, status } = useSession()
    const [availableYears, setAvailableYears] = useState([])

    useEffect(() => {
        if (transactions.length > 0) {
            setFilteredTransactions(transactions)
            const uniqueAssets = [
                ...new Set(
                    transactions.map((t) => t.symbol.replace(/\uFF0E/g, "."))
                ),
            ] // Unescape dots
            setAssets(uniqueAssets)
            setAvailableYears(getUniqueYears(transactions))
        }
    }, [transactions])

    const applyFilters = () => {
        let filtered = transactions
        if (selectedAsset) {
            filtered = filtered.filter((t) => t.symbol === selectedAsset)
        }
        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter((t) => {
                const transactionDate = new Date(t.date)
                return (
                    transactionDate >= dateRange.from &&
                    transactionDate <= dateRange.to
                )
            })
        }
        setFilteredTransactions(filtered)
    }

    const handleYearSelect = (year) => {
        const from = new Date(year, 0, 1) // January 1st
        const to = new Date(year, 11, 31) // December 31st
        setDateRange({ from, to })
    }

    useEffect(() => {
        applyFilters()
    }, [selectedAsset, dateRange, transactions])

    return (
        <Card className="my-4">
            <CardHeader className="flex flex-row justify-between space-y-0 pb-2 gap-4">
                <div className="flex items-center space-x-2">
                    <CardTitle>Transaction History</CardTitle>
                </div>
                <div className="flex space-x-2 flex-col-reverse sm:flex-row gap-2">
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
                                variant="outline"
                                className="font-normal ml-2"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from && dateRange.to ? (
                                    `${formatDate(
                                        dateRange.from
                                    )} - ${formatDate(dateRange.to)}`
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-2 flex flex-wrap gap-2 justify-end">
                                {availableYears.map((year) => (
                                    <Button
                                        key={year}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleYearSelect(year)}
                                    >
                                        {year}
                                    </Button>
                                ))}
                            </div>
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
                        <SelectTrigger className="w-full">
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
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">PnL</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                                <TableCell>
                                    {transaction.operation
                                        .charAt(0)
                                        .toUpperCase() +
                                        transaction.operation.slice(1)}
                                </TableCell>
                                <TableCell>
                                    {transaction.symbol
                                        .replace(/\uFF0E/g, ".")
                                        .toUpperCase()}{" "}
                                    {/* Unescape dots */}
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
                                    {formatNumber(
                                        transaction.operation === "buy"
                                            ? transaction.totalPaid /
                                                  transaction.shares
                                            : transaction.totalReceived /
                                                  transaction.shares
                                    )}
                                    &nbsp;€
                                </TableCell>
                                <TableCell className="text-right">
                                    {transaction.shares}
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
                                    {formatNumber(
                                        transaction.operation === "buy"
                                            ? transaction.totalPaid
                                            : transaction.totalReceived
                                    )}
                                    &nbsp;€
                                </TableCell>
                                <TableCell
                                    className={`text-right ${
                                        transaction.pnl > 0
                                            ? "text-green-500"
                                            : "text-red-500"
                                    } whitespace-nowrap`}
                                >
                                    {transaction.operation === "sell"
                                        ? `${formatNumber(transaction.pnl)} €`
                                        : ""}
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
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
