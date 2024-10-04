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

export default function RealizedPnLDialog({ children }) {
    const [pnlData, setPnlData] = useState([])
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchPnLData()
        }
    }, [status, session])

    const fetchPnLData = async () => {
        try {
            const url = `/api/portfolios/realized-pnl?userEmail=${encodeURIComponent(
                session.user.email
            )}`
            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                setPnlData(data)
            } else {
                console.error("Error response from API:", await response.text())
            }
        } catch (error) {
            console.error("Error fetching PnL data:", error)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[80%]">
                <DialogHeader>
                    <DialogTitle>Realized PnL by Asset</DialogTitle>
                </DialogHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead>Oldest Transaction</TableHead>
                            <TableHead>Last Sell</TableHead>
                            <TableHead className="text-right">
                                Shares Sold
                            </TableHead>
                            <TableHead className="text-right">
                                Total Invested
                            </TableHead>
                            <TableHead className="text-right">ROI</TableHead>
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
