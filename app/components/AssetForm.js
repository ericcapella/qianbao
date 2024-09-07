"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

export default function AssetForm({ onAssetAdded }) {
    const [symbol, setSymbol] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState("")
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
                    amount: parseFloat(amount),
                    userEmail: session.user.email,
                }),
            })

            if (!transactionResponse.ok) {
                throw new Error("Failed to add transaction")
            }

            onAssetAdded()
            setSymbol("")
            setAmount("")
            setDate("")
        } catch (error) {
            console.error("Error adding asset:", error)
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
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
            <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
            >
                Add Asset
            </button>
        </form>
    )
}
