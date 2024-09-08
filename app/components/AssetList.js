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
                const assetData = Object.entries(data.assets).map(
                    ([symbol, asset]) => ({
                        symbol,
                        currentPrice: asset.currentPrice,
                        invested: asset.shares * asset.paidPerShare,
                        position: asset.value,
                        shares: asset.shares,
                        buyInPrice: asset.paidPerShare,
                        profitLoss:
                            asset.value - asset.paidPerShare * asset.shares,
                    })
                )
                setAssets(assetData)
            }
        } catch (error) {
            console.error("Error fetching asset data:", error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Asset Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset name</TableHead>
                                    <TableHead className="text-right">
                                        Current price
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Invested
                                    </TableHead>
                                    <TableHead className="text-right">
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
                                        <TableCell className="text-right">
                                            {asset.currentPrice.toFixed(2)} €
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div>
                                                {asset.invested.toFixed(2)} €
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {asset.buyInPrice.toFixed(2)}{" "}
                                                €/share
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div>
                                                {asset.position.toFixed(2)} €
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {asset.shares} shares
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            className={`text-right ${
                                                asset.profitLoss >= 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            <div>
                                                {asset.profitLoss.toFixed(2)} €
                                            </div>
                                            <div className="text-sm">
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
                    </div>
                    <div>{children}</div>
                </div>
            </CardContent>
        </Card>
    )
}
