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
    const { data: session } = useSession()

    useEffect(() => {
        if (session?.user?.email) {
            fetchTransactions()
        }
    }, [session?.user?.email])

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
            }
        } catch (error) {
            console.error("Error fetching transactions:", error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
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
                        {transactions.map((transaction) => (
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
