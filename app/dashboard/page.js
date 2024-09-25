"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import AssetForm from "../components/AssetForm"
import AssetList from "../components/AssetList"
import AssetPieChart from "../components/AssetPieChart"
import TotalValueCard from "../components/TotalValueCard"
import TotalValueChart from "../components/TotalValueChart"
import TransactionsList from "../components/TransactionsList"
import EmptyPortfolioCard from "../components/EmptyPortfolioCard"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { UserIcon } from "lucide-react"
import Image from "next/image"

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    const { data: session, status } = useSession()
    const router = useRouter()
    const [transactions, setTransactions] = useState([])
    const [isAssetFormOpen, setIsAssetFormOpen] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchTransactions()
        }
    }, [status, session?.user?.email])

    const fetchTransactions = async () => {
        try {
            const response = await fetch(
                `/api/transactions?userEmail=${encodeURIComponent(
                    session.user.email
                )}`
            )
            if (response.ok) {
                const data = await response.json()
                // Unescape dots in symbols
                const unescapedData = data.map((transaction) => ({
                    ...transaction,
                    symbol: transaction.symbol.replace(/\uFF0E/g, "."),
                }))
                setTransactions(unescapedData)
            }
        } catch (error) {
            console.error("Error fetching transactions:", error)
        }
    }

    const handleAssetAdded = () => {
        setRefreshKey((prevKey) => prevKey + 1)
        setIsAssetFormOpen(false)
        fetchTransactions()
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    const handleOpenAssetForm = () => {
        setIsAssetFormOpen(true)
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
                <div className="">
                    <Image
                        src="/qianbao-logo.png"
                        alt="QianBao"
                        width={100}
                        height={40}
                    />
                </div>
                <div className="flex items-center space-x-4">
                    {transactions.length > 0 && (
                        <Button onClick={handleOpenAssetForm}>
                            Add Transaction
                        </Button>
                    )}
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
                </div>
            </header>
            <main className="px-24">
                <AssetForm
                    onAssetAdded={handleAssetAdded}
                    open={isAssetFormOpen}
                    onOpenChange={setIsAssetFormOpen}
                />
                {transactions.length < 0 ? (
                    <EmptyPortfolioCard
                        onAddTransaction={handleOpenAssetForm}
                    />
                ) : (
                    <>
                        <TotalValueChart key={`valuechart-${refreshKey}`} />
                        <AssetList key={`assetlist-${refreshKey}`}>
                            <AssetPieChart key={`piechart-${refreshKey}`} />
                        </AssetList>
                        <TransactionsList
                            key={`transactionlist-${refreshKey}`}
                            transactions={transactions}
                        />
                    </>
                )}
            </main>
        </div>
    )
}
