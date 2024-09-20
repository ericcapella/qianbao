"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

export default function AssetForm({ onAssetAdded }) {
    const [symbol, setSymbol] = useState("")
    const [shares, setShares] = useState("")
    const [totalAmount, setTotalAmount] = useState("")
    const [date, setDate] = useState("")
    const [operation, setOperation] = useState("buy")
    const { data: session } = useSession()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!session?.user?.email) {
            console.error("User not authenticated")
            return
        }

        try {
            // First, add or update the asset
            const assetResponse = await fetch("/api/assets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ symbol, date }),
            })

            if (!assetResponse.ok) {
                throw new Error("Failed to add/update asset")
            }

            // Then, add the transaction
            const transactionResponse = await fetch("/api/assets", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    symbol,
                    date,
                    shares: parseFloat(shares),
                    totalAmount: parseFloat(totalAmount),
                    userEmail: session.user.email,
                    operation,
                }),
            })

            if (!transactionResponse.ok) {
                const errorData = await transactionResponse.json()
                throw new Error(errorData.error || "Failed to add transaction")
            }

            onAssetAdded()
            setSymbol("")
            setShares("")
            setTotalAmount("")
            setDate("")
        } catch (error) {
            console.error("Error adding asset:", error)
            alert(error.message)
        }
    }

    const handleSharesChange = (e) => {
        const value = e.target.value
        if (value === "" || parseFloat(value) >= 0) {
            setShares(value)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add Transaction</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <Tabs value={operation} onValueChange={setOperation}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="buy">Buy</TabsTrigger>
                        <TabsTrigger value="sell">Sell</TabsTrigger>
                    </TabsList>
                    <TabsContent value="buy">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="symbol">Asset Symbol</Label>
                                <Input
                                    id="symbol"
                                    value={symbol}
                                    onChange={(e) =>
                                        setSymbol(e.target.value.toUpperCase())
                                    }
                                    placeholder="e.g., AAPL"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="shares">Number of Shares</Label>
                                <Input
                                    id="shares"
                                    type="number"
                                    value={shares}
                                    onChange={handleSharesChange}
                                    placeholder="0.00"
                                    required
                                    min="0"
                                    step="any"
                                />
                            </div>
                            <div>
                                <Label htmlFor="totalAmount">Total Paid</Label>
                                <Input
                                    id="totalAmount"
                                    type="number"
                                    value={totalAmount}
                                    onChange={(e) =>
                                        setTotalAmount(e.target.value)
                                    }
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${
                                                !date && "text-muted-foreground"
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date
                                                ? format(new Date(date), "PPP")
                                                : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                date
                                                    ? new Date(date)
                                                    : undefined
                                            }
                                            onSelect={(newDate) =>
                                                setDate(
                                                    newDate
                                                        ? format(
                                                              newDate,
                                                              "yyyy-MM-dd"
                                                          )
                                                        : ""
                                                )
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button type="submit">Add Transaction</Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="sell">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="symbol">Asset Symbol</Label>
                                <Input
                                    id="symbol"
                                    value={symbol}
                                    onChange={(e) =>
                                        setSymbol(e.target.value.toUpperCase())
                                    }
                                    placeholder="e.g., AAPL"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="shares">Number of Shares</Label>
                                <Input
                                    id="shares"
                                    type="number"
                                    value={shares}
                                    onChange={handleSharesChange}
                                    placeholder="0.00"
                                    required
                                    min="0"
                                    step="any"
                                />
                            </div>
                            <div>
                                <Label htmlFor="totalAmount">
                                    Total Received
                                </Label>
                                <Input
                                    id="totalAmount"
                                    type="number"
                                    value={totalAmount}
                                    onChange={(e) =>
                                        setTotalAmount(e.target.value)
                                    }
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${
                                                !date && "text-muted-foreground"
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date
                                                ? format(new Date(date), "PPP")
                                                : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                date
                                                    ? new Date(date)
                                                    : undefined
                                            }
                                            onSelect={(newDate) =>
                                                setDate(
                                                    newDate
                                                        ? format(
                                                              newDate,
                                                              "yyyy-MM-dd"
                                                          )
                                                        : ""
                                                )
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button type="submit">Add Transaction</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
