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

export default function TransactionList() {
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [assets, setAssets] = useState([])
    const [selectedAsset, setSelectedAsset] = useState(null)
    const [dateRange, setDateRange] = useState({ from: null, to: null })
    const { data: session, status } = useSession()
    const [availableYears, setAvailableYears] = useState([])

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
                setAvailableYears(getUniqueYears(data))
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
                                {dateRange.from && dateRange.to ? (
                                    dateRange.from.getFullYear() ===
                                        dateRange.to.getFullYear() &&
                                    dateRange.from.getMonth() === 0 &&
                                    dateRange.to.getMonth() === 11 &&
                                    dateRange.from.getDate() === 1 &&
                                    dateRange.to.getDate() === 31 ? (
                                        `Year ${dateRange.from.getFullYear()}`
                                    ) : (
                                        <>
                                            {formatDate(dateRange.from)} -{" "}
                                            {formatDate(dateRange.to)}
                                        </>
                                    )
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
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            <TableHead className="text-right">PnL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                                <TableCell>{transaction.operation}</TableCell>
                                <TableCell>
                                    {transaction.symbol.toUpperCase()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNumber(
                                        transaction.operation === "buy"
                                            ? transaction.totalPaid /
                                                  transaction.shares
                                            : transaction.totalReceived /
                                                  transaction.shares
                                    )}{" "}
                                    €
                                </TableCell>
                                <TableCell className="text-right">
                                    {transaction.shares}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNumber(
                                        transaction.operation === "buy"
                                            ? transaction.totalPaid
                                            : transaction.totalReceived
                                    )}{" "}
                                    €
                                </TableCell>
                                <TableCell className="text-right">
                                    {new Date(
                                        transaction.date
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {transaction.operation === "sell"
                                        ? `${formatNumber(transaction.pnl)} €`
                                        : "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
