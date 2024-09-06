"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

export default function AssetForm({ onAssetAdded }) {
    const [symbol, setSymbol] = useState("")
    const [date, setDate] = useState("")
    const [amount, setAmount] = useState("")
    const { data: session } = useSession()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!session) {
            alert("You must be logged in to add assets")
            return
        }
        try {
            console.log(`Submitting asset: ${symbol}`)
            const assetResponse = await fetch("/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symbol }),
            })

            if (assetResponse.ok) {
                const assetData = await assetResponse.json()
                console.log(`Asset response:`, assetData)

                console.log(`Adding transaction for ${symbol}`)
                const transactionResponse = await fetch("/api/assets", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        symbol,
                        date,
                        amount: parseFloat(amount),
                        userEmail: session.user.email,
                    }),
                })

                if (transactionResponse.ok) {
                    const transactionData = await transactionResponse.json()
                    console.log(`Transaction response:`, transactionData)
                    setSymbol("")
                    setDate("")
                    setAmount("")
                    onAssetAdded()
                } else {
                    const data = await transactionResponse.json()
                    console.error(`Transaction error:`, data)
                    alert(data.error || "Failed to add transaction")
                }
            } else {
                const data = await assetResponse.json()
                console.error(`Asset error:`, data)
                alert(data.error || "Failed to add or update asset")
            }
        } catch (error) {
            console.error("Error adding asset and transaction:", error)
            alert("Failed to add asset and transaction")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter asset symbol (e.g., VUAA.DE)"
                className="border p-2 mr-2"
                required
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border p-2 mr-2"
                required
            />
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="border p-2 mr-2"
                required
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
