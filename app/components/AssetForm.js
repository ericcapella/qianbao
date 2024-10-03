"use client"

import { useState, useEffect } from "react"
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

export default function AssetForm({ onAssetAdded, open, onOpenChange }) {
    const [symbol, setSymbol] = useState("")
    const [shares, setShares] = useState("")
    const [totalAmount, setTotalAmount] = useState("")
    const [date, setDate] = useState("")
    const [operation, setOperation] = useState("buy")
    const { data: session, status } = useSession()
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [ownedAssets, setOwnedAssets] = useState([])
    const [maxShares, setMaxShares] = useState(0)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showSuggestions && !event.target.closest("#symbol")) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showSuggestions])

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchOwnedAssets()
        }
    }, [status, session?.user?.email])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!session?.user?.email) {
            console.error("User not authenticated")
            return
        }

        try {
            const assetResponse = await fetch("/api/assets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    symbol: symbol.replace(/\./g, "\uFF0E"),
                    date,
                }), // Escape dots
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
                    symbol: symbol.replace(/\./g, "\uFF0E"), // Escape dots
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

    const fetchSuggestions = async (value) => {
        if (value.length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        try {
            const response = await fetch(
                `/api/search-symbol?keywords=${encodeURIComponent(value)}`
            )
            if (response.ok) {
                const data = await response.json()
                if (Array.isArray(data) && data.length > 0) {
                    setSuggestions(data)
                    setShowSuggestions(true)
                } else {
                    setSuggestions([])
                    setShowSuggestions(false)
                }
            } else {
                console.error(
                    "Error fetching suggestions:",
                    response.statusText
                )
                setSuggestions([])
                setShowSuggestions(false)
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error)
            setSuggestions([])
            setShowSuggestions(false)
        }
    }

    const fetchOwnedAssets = async () => {
        if (!session?.user?.email) return

        try {
            const response = await fetch(
                `/api/portfolios/total-value?userEmail=${encodeURIComponent(
                    session.user.email
                )}`
            )
            if (response.ok) {
                const data = await response.json()
                const assetData = Object.entries(data.assets)
                    .filter(([_, asset]) => asset.shares > 0)
                    .map(([symbol, asset]) => ({
                        symbol: symbol.replace(/\uFF0E/g, "."), // Unescape dots
                        name: asset.name || symbol.replace(/\uFF0E/g, "."), // Unescape dots in name if it's the same as symbol
                        shares: asset.shares,
                    }))
                setOwnedAssets(assetData)
            }
        } catch (error) {
            console.error("Error fetching owned assets:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                            <div className="relative">
                                <Label htmlFor="symbol">Asset Symbol</Label>
                                <Input
                                    id="symbol"
                                    value={symbol}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.toUpperCase()
                                        setSymbol(value)
                                        fetchSuggestions(value)
                                    }}
                                    onBlur={() => {
                                        setTimeout(
                                            () => setShowSuggestions(false),
                                            200
                                        )
                                    }}
                                    placeholder="e.g., AAPL"
                                    required
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto">
                                        {suggestions.map((suggestion) => (
                                            <li
                                                key={suggestion.symbol}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onMouseDown={(e) => {
                                                    e.preventDefault() // Prevent blur event from firing
                                                    setSymbol(suggestion.symbol)
                                                    setShowSuggestions(false)
                                                    // Update the input value directly
                                                    const symbolInput =
                                                        document.getElementById(
                                                            "symbol"
                                                        )
                                                    if (symbolInput) {
                                                        symbolInput.value =
                                                            suggestion.symbol
                                                    }
                                                }}
                                            >
                                                {suggestion.symbol} -{" "}
                                                {suggestion.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
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
                            <div className="relative">
                                <Label htmlFor="symbol-sell">
                                    Asset Symbol
                                </Label>
                                <Input
                                    id="symbol-sell"
                                    value={symbol}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.toUpperCase()
                                        setSymbol(value)
                                        const filteredAssets =
                                            ownedAssets.filter((asset) =>
                                                asset.symbol.includes(value)
                                            )
                                        setSuggestions(filteredAssets)
                                        setShowSuggestions(
                                            filteredAssets.length > 0
                                        )
                                    }}
                                    onBlur={() => {
                                        setTimeout(
                                            () => setShowSuggestions(false),
                                            200
                                        )
                                    }}
                                    placeholder="e.g., AAPL"
                                    required
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto">
                                        {suggestions.map((suggestion) => (
                                            <li
                                                key={suggestion.symbol}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    setSymbol(suggestion.symbol)
                                                    setMaxShares(
                                                        suggestion.shares
                                                    )
                                                    setShares("") // Reset shares input when a new asset is selected
                                                    setShowSuggestions(false)
                                                }}
                                            >
                                                {suggestion.symbol} (
                                                {suggestion.shares} owned)
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="shares-sell">
                                    Number of Shares
                                </Label>
                                <Input
                                    id="shares-sell"
                                    type="number"
                                    value={shares}
                                    onChange={handleSharesChange}
                                    placeholder="0.00"
                                    required
                                    min="0"
                                    max={maxShares}
                                    step="any"
                                />
                                {parseFloat(shares) > maxShares && (
                                    <p className="text-sm text-red-500 mt-1">
                                        You only own {maxShares} shares
                                    </p>
                                )}
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
