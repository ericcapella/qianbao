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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { UserIcon } from "lucide-react"
import { signOut } from "next-auth/react"

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

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (status === "unauthenticated") {
        return null
    }

    return (
        <div>
            <header className="flex justify-between items-center py-4 px-24">
                <div className="w-10 h-10 bg-gray-200">
                    {/* Placeholder for logo */}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <UserIcon className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">
                                {session.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {session.user.email}
                            </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleLogout}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="px-24">
                <AssetForm onAssetAdded={handleAssetAdded} />
                <TotalValueChart key={`valuechart-${refreshKey}`} />
                <AssetList key={`assetlist-${refreshKey}`}>
                    <AssetPieChart key={`piechart-${refreshKey}`} />
                </AssetList>
                <TransactionsList key={`transactionlist-${refreshKey}`} />
            </main>
        </div>
    )
}
