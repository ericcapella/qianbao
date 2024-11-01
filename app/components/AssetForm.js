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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { fetchWithAuth } from "@/api-auth"
import { formatShares } from "@/lib/utils"

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
    const [assetType, setAssetType] = useState("stock")
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

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
        if (status === "authenticated" && session?.user?.id) {
            fetchOwnedAssets()
        }
    }, [status, session?.user?.id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!session?.user?.id) {
            console.error("User not authenticated")
            return
        }

        try {
            const assetResponse = await fetchWithAuth("/api/assets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    symbol: symbol.replace(/\./g, "\uFF0E"),
                    date,
                    assetType,
                }),
            })

            // Then, add the transaction
            const transactionResponse = await fetchWithAuth("/api/assets", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    symbol: symbol.replace(/\./g, "\uFF0E"),
                    date,
                    shares: parseFloat(shares),
                    totalPaid: parseFloat(totalAmount),
                    userId: session.user.id,
                    operation,
                    assetType,
                }),
            })

            onAssetAdded()
            setSymbol("")
            setShares("")
            setTotalAmount("")
            setDate("")
        } catch (error) {
            console.error("Error adding asset or transaction:", error)
            // You might want to show an error message to the user here
        }
    }

    const handleSharesChange = (e) => {
        const value = e.target.value
        if (value === "" || parseFloat(value) >= 0) {
            setShares(value)
        }
    }

    const fetchSuggestions = async (value) => {
        if (value.length < 2 || assetType !== "stock") {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        try {
            const data = await fetchWithAuth(
                `/api/search-symbol?keywords=${encodeURIComponent(value)}`
            )
            if (data.length > 0) {
                setSuggestions(data)
                setShowSuggestions(true)
            } else {
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
        if (!session?.user?.id) return

        try {
            const data = await fetchWithAuth(
                `/api/portfolios/total-value?userId=${encodeURIComponent(
                    session.user.id
                )}`
            )
            const assetData = Object.entries(data.assets)
                .filter(([_, asset]) => asset.shares > 0)
                .map(([symbol, asset]) => ({
                    symbol: symbol.replace(/\uFF0E/g, "."), // Unescape dots
                    name: asset.name || symbol.replace(/\uFF0E/g, "."), // Unescape dots in name if it's the same as symbol
                    shares: asset.shares,
                }))
            setOwnedAssets(assetData)
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
                                <Label htmlFor="asset">Asset</Label>
                                <div className="flex border rounded-md overflow-hidden">
                                    <div className="w-2/6 bg-white p-[4px] flex items-center">
                                        <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-[2px] w-full focus:outline-none shadow-none border-0">
                                            <Select
                                                value={assetType}
                                                onValueChange={setAssetType}
                                                className="rounded-[15px]"
                                            >
                                                <SelectTrigger className="w-full h-full border-0 focus:ring-0 bg-transparent px-2 py-1.5 focus:outline-none shadow-none border-0">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="stock">
                                                        Stock/ETF
                                                    </SelectItem>
                                                    <SelectItem value="crypto">
                                                        Crypto/DeFi
                                                    </SelectItem>
                                                    <SelectItem value="custom">
                                                        Custom Asset
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Input
                                        id="symbol"
                                        className="w-4/6 border-0 focus:ring-0 focus:outline-none shadow-none py-1.5 mt-[2px] mr-[2px]"
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
                                        placeholder={
                                            assetType === "crypto"
                                                ? "e.g., BTC"
                                                : assetType === "custom"
                                                ? "e.g., house"
                                                : "e.g., AAPL"
                                        }
                                        required
                                    />
                                </div>
                                {assetType === "stock" &&
                                    showSuggestions &&
                                    suggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                                            {suggestions.map((suggestion) => (
                                                <li
                                                    key={suggestion.symbol}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault()
                                                        setSymbol(
                                                            suggestion.symbol
                                                        )
                                                        setShowSuggestions(
                                                            false
                                                        )
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
                                                    <span className="font-medium">
                                                        {suggestion.symbol}
                                                    </span>{" "}
                                                    <span className="text-gray-600">
                                                        - {suggestion.name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Popover
                                    open={isCalendarOpen}
                                    onOpenChange={setIsCalendarOpen}
                                >
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
                                            onSelect={(newDate) => {
                                                setDate(
                                                    newDate
                                                        ? format(
                                                              newDate,
                                                              "yyyy-MM-dd"
                                                          )
                                                        : ""
                                                )
                                                setIsCalendarOpen(false)
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
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
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                                        {suggestions.map((suggestion) => (
                                            <li
                                                key={suggestion.symbol}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out"
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
                                                <span className="font-medium">
                                                    {suggestion.symbol}
                                                </span>{" "}
                                                <span className="text-gray-600">
                                                    (
                                                    {formatShares(
                                                        suggestion.shares
                                                    )}{" "}
                                                    owned)
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Popover
                                    open={isCalendarOpen}
                                    onOpenChange={setIsCalendarOpen}
                                >
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
                                            onSelect={(newDate) => {
                                                setDate(
                                                    newDate
                                                        ? format(
                                                              newDate,
                                                              "yyyy-MM-dd"
                                                          )
                                                        : ""
                                                )
                                                setIsCalendarOpen(false)
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
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
                            <Button type="submit">Add Transaction</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
