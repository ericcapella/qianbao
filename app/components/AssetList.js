"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"

export default function AssetList({ children }) {
    const [assets, setAssets] = useState([])
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchAssetData()
        }
    }, [status, session?.user?.email])

    const fetchAssetData = async () => {
        try {
            const response = await fetch(
                `/api/portfolios/total-value?userEmail=${encodeURIComponent(
                    session.user.email
                )}`
            )
            if (response.ok) {
                const data = await response.json()
                const assetData = Object.entries(data.assets)
                    .filter(([_, asset]) => asset.shares > 0)
                    .map(([symbol, asset]) => ({
                        symbol: symbol.replace(/\uFF0E/g, "."), // Unescape dots
                        currentPrice: asset.currentPrice,
                        invested: asset.shares * asset.paidPerShare,
                        position: asset.value,
                        shares: asset.shares,
                        buyInPrice: asset.paidPerShare,
                        profitLoss:
                            asset.value - asset.paidPerShare * asset.shares,
                    }))
                setAssets(assetData)
            }
        } catch (error) {
            console.error("Error fetching asset data:", error)
        }
    }

    return (
        <Card className="my-4">
            <div className="flex flex-col lg:flex-row">
                <div className="lg:w-3/5">
                    <CardHeader>
                        <CardTitle>Asset Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset name</TableHead>
                                    <TableHead className="text-left">
                                        Current price
                                    </TableHead>
                                    <TableHead className="text-left">
                                        Invested
                                    </TableHead>
                                    <TableHead className="text-left">
                                        Position
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Profit/Loss
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.map((asset) => (
                                    <TableRow key={asset.symbol}>
                                        <TableCell className="font-medium">
                                            {asset.symbol.toUpperCase()}
                                        </TableCell>
                                        <TableCell className="text-left whitespace-nowrap">
                                            {formatNumber(asset.currentPrice)}
                                            &nbsp;€
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <div className="whitespace-nowrap">
                                                {formatNumber(asset.invested)}
                                                &nbsp;€
                                            </div>
                                            <div className="text-sm text-gray-500 whitespace-nowrap">
                                                {formatNumber(asset.buyInPrice)}
                                                &nbsp;€/share
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <div className="whitespace-nowrap">
                                                {formatNumber(asset.position)}
                                                &nbsp;€
                                            </div>
                                            <div className="text-sm text-gray-500 whitespace-nowrap">
                                                {asset.shares}&nbsp;shares
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            className={`text-right ${
                                                asset.profitLoss >= 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            <div className="whitespace-nowrap">
                                                {formatNumber(asset.profitLoss)}
                                                &nbsp;€
                                            </div>
                                            <div className="text-sm whitespace-nowrap">
                                                {(
                                                    (asset.profitLoss /
                                                        asset.invested) *
                                                    100
                                                ).toFixed(2)}
                                                %
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </div>
                <div className="lg:w-2/5">{children}</div>
            </div>
        </Card>
    )
}
