import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function EmptyPortfolioCard({ onAddTransaction }) {
    return (
        <div className="flex flex-col items-center p-6 space-y-4 my-24">
            <p className="text-center text-lg">
                Add a transaction to start tracking your investment portfolio
            </p>
            <Button onClick={onAddTransaction}>Add Transaction</Button>
        </div>
    )
}
