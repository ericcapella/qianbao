"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

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

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Asset Symbol (e.g., AAPL)"
                required
                className="mr-2 p-2 border rounded"
            />
            <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="Number of Shares"
                required
                className="mr-2 p-2 border rounded"
            />
            <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder={
                    operation === "buy" ? "Total Paid" : "Total Received"
                }
                required
                className="mr-2 p-2 border rounded"
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mr-2 p-2 border rounded"
            />
            <div className="mb-4">
                <label
                    htmlFor="operation"
                    className="block text-sm font-medium text-gray-700"
                >
                    Operation
                </label>
                <select
                    id="operation"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                </select>
            </div>
            <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded"
            >
                Add Transaction
            </button>
        </form>
    )
}
