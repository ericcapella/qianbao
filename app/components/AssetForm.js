"use client"

import { useState } from "react"

export default function AssetForm({ onAssetAdded }) {
    const [symbol, setSymbol] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch("/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symbol }),
            })

            if (response.ok) {
                setSymbol("")
                onAssetAdded()
            } else {
                const data = await response.json()
                alert(data.error || "Failed to add asset")
            }
        } catch (error) {
            console.error("Error adding asset:", error)
            alert("Failed to add asset")
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
            <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
            >
                Add Asset
            </button>
        </form>
    )
}
