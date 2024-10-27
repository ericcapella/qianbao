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
import DashboardSkeleton from "../components/DashboardSkeleton"
import Link from "next/link"
import { RefreshCcw } from "lucide-react"
import Footer from "../components/Footer"
import { fetchWithAuth } from "@/api-auth"
import Head from "next/head"

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    const { data: session, status } = useSession()
    const router = useRouter()
    const [transactions, setTransactions] = useState([])
    const [isAssetFormOpen, setIsAssetFormOpen] = useState(false)
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [lastRefreshed, setLastRefreshed] = useState(null)
    const [oldestPriceDate, setOldestPriceDate] = useState(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            fetchTransactions()
            fetchPortfolioData()
        }
    }, [status, session?.user?.id])

    const fetchPortfolioData = async () => {
        try {
            const data = await fetchWithAuth(
                `/api/portfolios?userId=${encodeURIComponent(session.user.id)}`
            )
            setLastRefreshed(data.lastRefreshed)
            setOldestPriceDate(data.oldestPriceDate)
        } catch (error) {
            console.error("Error fetching portfolio data:", error)
        }
    }

    const fetchTransactions = async () => {
        setIsDataLoading(true)
        try {
            const data = await fetchWithAuth(
                `/api/transactions?userId=${encodeURIComponent(
                    session.user.id
                )}`
            )
            const unescapedData = data.map((transaction) => ({
                ...transaction,
                symbol: transaction.symbol.replace(/\uFF0E/g, "."),
            }))
            setTransactions(unescapedData)
        } catch (error) {
            console.error("Error fetching transactions:", error)
        } finally {
            setIsDataLoading(false)
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

    const handleRefreshPortfolio = async () => {
        try {
            const response = await fetchWithAuth("/api/portfolios/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: session.user.id }),
            })

            // Refresh the dashboard data regardless of the response
            setRefreshKey((prevKey) => prevKey + 1)
            fetchTransactions()
            fetchPortfolioData()
        } catch (error) {
            console.error("Error refreshing portfolio:", error)
        }
    }

    const formatLastRefreshed = (lastRefreshed, oldestPriceDate) => {
        if (!lastRefreshed || !oldestPriceDate) return "Never"
        const now = new Date()
        const refreshDate = new Date(lastRefreshed)
        const mostRecentDate = new Date(
            Math.max(new Date(lastRefreshed), new Date(oldestPriceDate))
        )

        const diffDays = Math.floor(
            (now - mostRecentDate) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === 0) {
            return "Last refreshed today"
        } else if (diffDays === 1) {
            return "Last refreshed yesterday"
        } else if (diffDays <= 30) {
            return `Last refreshed ${diffDays} days ago`
        } else {
            return `Last refreshed on ${mostRecentDate.toLocaleDateString(
                "en-GB"
            )}`
        }
    }

    if (status === "loading" || isDataLoading) {
        return <DashboardSkeleton />
    }

    if (status === "unauthenticated") {
        return null
    }

    return (
        <div>
            <Head>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <header className="flex justify-between items-center py-4 mx-auto px-4 lg:max-w-[1150px]">
                <div className="">
                    <Link href="/">
                        <Image
                            src="/qianbao-logo.png"
                            alt="QianBao"
                            width={110}
                            height={22}
                        />
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    {transactions.length > 0 && (
                        <Button
                            onClick={handleOpenAssetForm}
                            className="font-normal"
                        >
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
                            <DropdownMenuItem onSelect={handleLogout}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="mx-auto px-4 lg:max-w-[1150px]">
                <AssetForm
                    onAssetAdded={handleAssetAdded}
                    open={isAssetFormOpen}
                    onOpenChange={setIsAssetFormOpen}
                />
                {transactions.length === 0 ? (
                    <EmptyPortfolioCard
                        onAddTransaction={handleOpenAssetForm}
                    />
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
                            <h1 className="text-2xl font-medium w-full sm:w-auto mb-2 sm:mb-0">
                                {session.user.name}'s investment portfolio
                            </h1>
                            <div className="flex items-center justify-end space-x-4">
                                <div className="flex items-center">
                                    <span className="text-sm text-muted-foreground mr-2">
                                        {formatLastRefreshed(
                                            lastRefreshed,
                                            oldestPriceDate
                                        )}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleRefreshPortfolio}
                                        title="Refresh portfolio"
                                        className="p-0"
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <TotalValueChart
                            key={`valuechart-${refreshKey}`}
                            userId={session.user.id}
                        />
                        <AssetList
                            key={`assetlist-${refreshKey}`}
                            userId={session.user.id}
                        >
                            <AssetPieChart
                                key={`piechart-${refreshKey}`}
                                userId={session.user.id}
                            />
                        </AssetList>
                        <TransactionsList
                            key={`transactionlist-${refreshKey}`}
                            transactions={transactions}
                        />
                    </>
                )}
            </main>
            <Footer />
        </div>
    )
}
