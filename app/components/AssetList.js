"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function AssetList() {
    const [assets, setAssets] = useState([])
    const { data: session } = useSession()

    const fetchAssets = async () => {
        if (!session) return
        try {
            const response = await fetch(
                `/api/assets?userEmail=${encodeURIComponent(
                    session.user.email
                )}`
            )
            if (response.ok) {
                const data = await response.json()
                setAssets(data)
            }
        } catch (error) {
            console.error("Error fetching assets:", error)
        }
    }

    useEffect(() => {
        fetchAssets()
    }, [session])

    if (!session) {
        return <div>Please log in to view your assets.</div>
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-2">Asset List</h2>
            <ul>
                {assets.map((asset) => (
                    <li key={asset.symbol} className="mb-2">
                        <strong>{asset.symbol}</strong>:{" "}
                        {(
                            parseFloat(
                                asset.data["Weekly Time Series"]?.[
                                    Object.keys(
                                        asset.data["Weekly Time Series"]
                                    )[0]
                                ]?.["4. close"]
                            ) * asset.totalAmount
                        ).toFixed(2)}
                        € (Price:{" "}
                        {
                            asset.data["Weekly Time Series"]?.[
                                Object.keys(asset.data["Weekly Time Series"])[0]
                            ]?.["4. close"]
                        }
                        €, Amount: {asset.totalAmount})
                    </li>
                ))}
            </ul>
        </div>
    )
}
