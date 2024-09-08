"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AssetForm from "../components/AssetForm"
import AssetList from "../components/AssetList"
import AssetPieChart from "../components/AssetPieChart"
import TotalValueCard from "../components/TotalValueCard"
import TotalValueChart from "../components/TotalValueChart"

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
    }, [status, router])

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
        <div className="p-24">
            <TotalValueCard />
            <TotalValueChart />
            <AssetForm onAssetAdded={handleAssetAdded} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AssetList key={refreshKey} onAssetsLoaded={setAssets} />
                <AssetPieChart assets={assets} />
            </div>
        </div>
    )
}
