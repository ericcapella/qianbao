"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function AssetList({ onAssetsLoaded }) {
    const [portfolio, setPortfolio] = useState({
        assets: {},
        lastRefreshed: null,
    })
    const [assetPrices, setAssetPrices] = useState({})
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchPortfolio()
        }
    }, [status, session?.user?.email])

    const fetchPortfolio = async () => {
        if (!session?.user?.email) return
        try {
            const response = await fetch(
                `/api/portfolios?userEmail=${encodeURIComponent(
                    session.user.email
                )}`
            )
            if (response.ok) {
                const data = await response.json()
                if (JSON.stringify(data) !== JSON.stringify(portfolio)) {
                    setPortfolio(data)
                    onAssetsLoaded(data.assets)
                    fetchAssetPrices(Object.keys(data.assets))
                }
            }
        } catch (error) {
            console.error("Error fetching portfolio:", error)
        }
    }

    const fetchAssetPrices = async (symbols) => {
        try {
            const response = await fetch(
                `/api/assets?symbols=${symbols.join(",")}`
            )
            if (response.ok) {
                const assets = await response.json()
                console.log("Fetched assets:", assets)
                const prices = assets.reduce((acc, asset) => {
                    if (asset.prices) {
                        const latestDate = Object.keys(asset.prices)[0]
                        const latestPrice = asset.prices[latestDate]
                        acc[asset.symbol] = parseFloat(latestPrice)
                    } else {
                        console.error("Unexpected asset structure:", asset)
                    }
                    return acc
                }, {})
                console.log("Calculated prices:", prices)
                setAssetPrices(prices)
            } else {
                console.error(
                    "Error fetching asset prices:",
                    response.statusText
                )
            }
        } catch (error) {
            console.error("Error fetching asset prices:", error)
        }
    }

    if (status === "loading") {
        return <div>Loading assets...</div>
    }

    if (!session) {
        return <div>Please log in to view your assets.</div>
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-2">Asset List</h2>
            {portfolio.assets && Object.keys(portfolio.assets).length > 0 ? (
                <ul>
                    {Object.entries(portfolio.assets).map(([symbol, asset]) => (
                        <li key={symbol} className="mb-2">
                            <strong>{symbol}</strong>: {asset.shares} shares
                            {assetPrices[symbol] && (
                                <span>
                                    {" "}
                                    - Value: $
                                    {(
                                        asset.shares * assetPrices[symbol]
                                    ).toFixed(2)}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No assets in your portfolio.</p>
            )}
            {portfolio.lastRefreshed && (
                <p className="text-sm text-gray-500 mt-2">
                    Last refreshed:{" "}
                    {new Date(portfolio.lastRefreshed).toLocaleString()}
                </p>
            )}
        </div>
    )
}
