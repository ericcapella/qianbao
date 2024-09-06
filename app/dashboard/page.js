"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AssetForm from "../components/AssetForm"
import AssetList from "../components/AssetList"
import AssetPieChart from "../components/AssetPieChart"

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    const [assets, setAssets] = useState([])
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        console.log("Session status:", status)
        console.log("Session data:", session)
        if (status === "unauthenticated") {
            console.log("Redirecting to login...")
            router.push("/login")
        } else if (status === "authenticated" && session) {
            console.log("Authenticated session:", session)
        }
    }, [status, session, router])

    const handleAssetAdded = () => {
        setRefreshKey((prevKey) => prevKey + 1)
    }

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (status === "unauthenticated") {
        return null
    }

    return (
        <main className="p-24">
            <h1 className="text-3xl font-bold mb-4">Stock Asset Tracker</h1>
            <AssetForm onAssetAdded={handleAssetAdded} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AssetList key={refreshKey} onAssetsLoaded={setAssets} />
                <AssetPieChart assets={assets} />
            </div>
        </main>
    )
}
