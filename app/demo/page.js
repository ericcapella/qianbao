"use client"

import { useState, useEffect } from "react"
import AssetList from "../components/AssetList"
import AssetPieChart from "../components/AssetPieChart"
import TotalValueChart from "../components/TotalValueChart"
import TransactionsList from "../components/TransactionsList"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import DashboardSkeleton from "../components/DashboardSkeleton"
import Link from "next/link"
import { RefreshCcw } from "lucide-react"
import Footer from "../components/Footer"
import { fetchWithAuth } from "@/api-auth"

export default function DemoPortfolio() {
    const [refreshKey, setRefreshKey] = useState(0)
    const [transactions, setTransactions] = useState([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [lastRefreshed, setLastRefreshed] = useState(null)
    const [oldestPriceDate, setOldestPriceDate] = useState(null)

    const demoEmail = "demo@qianbao.finance"

    useEffect(() => {
        fetchTransactions()
        fetchPortfolioData()
    }, [])

    const fetchPortfolioData = async () => {
        try {
            const data = await fetchWithAuth(
                `/api/portfolios?userEmail=${encodeURIComponent(demoEmail)}`
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
                `/api/transactions?userEmail=${encodeURIComponent(demoEmail)}`
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

    const handleRefreshPortfolio = async () => {
        try {
            await fetchWithAuth("/api/portfolios/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail: demoEmail }),
            })

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

    if (isDataLoading) {
        return <DashboardSkeleton />
    }

    return (
        <div>
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
                    <Button asChild>
                        <Link href="/register">Create Your Portfolio</Link>
                    </Button>
                </div>
            </header>
            <main className="mx-auto px-4 lg:max-w-[1150px]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
                    <h1 className="text-2xl font-medium w-full sm:w-auto mb-2 sm:mb-0">
                        Demo Investment Portfolio
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
                    userEmail={demoEmail}
                />
                <AssetList
                    key={`assetlist-${refreshKey}`}
                    userEmail={demoEmail}
                >
                    <AssetPieChart
                        key={`piechart-${refreshKey}`}
                        userEmail={demoEmail}
                    />
                </AssetList>
                <TransactionsList
                    key={`transactionlist-${refreshKey}`}
                    transactions={transactions}
                />
            </main>
            <Footer />
        </div>
    )
}
