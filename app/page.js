"use client"

import { useState } from "react"
import AssetForm from "./components/AssetForm"
import AssetList from "./components/AssetList"

export default function Home() {
    const [refreshKey, setRefreshKey] = useState(0)

    const handleAssetAdded = () => {
        setRefreshKey((prevKey) => prevKey + 1)
    }

    return (
        <main className="p-24">
            <h1 className="text-3xl font-bold mb-4">Stock Asset Tracker</h1>
            <AssetForm onAssetAdded={handleAssetAdded} />
            <AssetList key={refreshKey} />
        </main>
    )
}
