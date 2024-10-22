import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatNumber, formatDate } from "@/lib/utils"
import { fetchWithAuth } from "@/api-auth"

export default function RealizedPnLDialog({ children }) {
    const [pnlData, setPnlData] = useState([])
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            fetchPnLData()
        }
    }, [status, session])

    const fetchPnLData = async () => {
        try {
            const url = `/api/portfolios/realized-pnl?userId=${encodeURIComponent(
                session.user.id
            )}`
            const data = await fetchWithAuth(url)
            // Filter out assets without sell transactions
            const filteredData = data.filter((item) => item.totalSharesSold > 0)
            setPnlData(filteredData)
        } catch (error) {
            console.error("Error fetching PnL data:", error)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[80%]">
                <DialogHeader>
                    <DialogTitle>Realized PnL by asset (All time)</DialogTitle>
                </DialogHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead className="w-48">
                                Oldest Transaction
                            </TableHead>
                            <TableHead>Last Sell</TableHead>
                            <TableHead className="text-right">
                                Shares Sold
                            </TableHead>
                            <TableHead className="text-right">
                                Total Invested
                            </TableHead>
                            <TableHead className="text-right">ROI</TableHead>
                            <TableHead className="text-right w-40">
                                Annualized Return
                            </TableHead>
                            <TableHead className="text-right">PnL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pnlData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No realized PnL data available
                                </TableCell>
                            </TableRow>
                        ) : (
                            pnlData.map((item) => (
                                <TableRow key={item.symbol}>
                                    <TableCell>
                                        {item.symbol
                                            .replace(/\uFF0E/g, ".")
                                            .toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(item.oldestTransaction)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(item.lastSellTransaction)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatNumber(item.totalSharesSold)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatNumber(item.totalInvested)} €
                                    </TableCell>
                                    <TableCell
                                        className={`text-right ${
                                            item.roi >= 0
                                                ? "text-green-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {formatNumber(item.roi * 100)}%
                                    </TableCell>
                                    <TableCell
                                        className={`text-right ${
                                            item.annualizedReturn >= 0
                                                ? "text-green-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {formatNumber(
                                            item.annualizedReturn * 100
                                        )}
                                        %
                                    </TableCell>
                                    <TableCell
                                        className={`text-right ${
                                            item.pnl >= 0
                                                ? "text-green-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {formatNumber(item.pnl)} €
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}
