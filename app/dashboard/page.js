"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AssetForm from "../components/AssetForm"
import AssetList from "../components/AssetList"

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    const { data: session, status } = useSession()
    const router = useRouter()

    const handleAssetAdded = () => {
        setRefreshKey((prevKey) => prevKey + 1)
    }

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (!session) {
        router.push("/login")
        return null
    }

    return (
        <main className="p-24">
            <h1 className="text-3xl font-bold mb-4">Stock Asset Tracker</h1>
            <AssetForm onAssetAdded={handleAssetAdded} />
            <AssetList key={refreshKey} />
        </main>
    )
}
