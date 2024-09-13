"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AssetForm from "../components/AssetForm"
import AssetList from "../components/AssetList"
import AssetPieChart from "../components/AssetPieChart"
import TotalValueCard from "../components/TotalValueCard"
import TotalValueChart from "../components/TotalValueChart"
import TransactionsList from "../components/TransactionsList"

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
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
            <AssetForm onAssetAdded={handleAssetAdded} />
            <TotalValueChart key={`valuechart-${refreshKey}`} />
            <AssetList key={`assetlist-${refreshKey}`}>
                <AssetPieChart key={`piechart-${refreshKey}`} />
            </AssetList>
            <TransactionsList key={`transactionlist-${refreshKey}`} />
        </div>
    )
}
