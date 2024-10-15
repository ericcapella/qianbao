"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import RealizedPnLDialog from "./RealizedPnLDialog"
import { useSession } from "next-auth/react"
import { motion, useSpring, useTransform } from "framer-motion"

const AnimatedNumber = ({ value }) => {
    const spring = useSpring(0, { stiffness: 9999, damping: 5000 })
    const display = useTransform(spring, (current) => formatNumber(current))

    useEffect(() => {
        spring.set(value)
    }, [spring, value])

    return <motion.span>{display}</motion.span>
}

export default function TotalValueCard({
    totalValue,
    variation,
    totalInvestedInPeriod,
    totalPnLInPeriod,
}) {
    const { data: session } = useSession()
    const isPositive = variation.percentage >= 0
    const textColor = isPositive ? "text-green-500" : "text-red-500"

    return (
        <Card className="w-full md:w-6/12 border-0 shadow-none">
            <CardContent className="flex flex-col sm:flex-row justify-between p-0 gap-6">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">
                        Total Portfolio
                    </span>
                    <span className="text-2xl font-bold">
                        <AnimatedNumber value={totalValue} />€
                    </span>
                    <span className={`text-xs ${textColor}`}>
                        <AnimatedNumber value={Math.abs(variation.value)} />€{" "}
                        {isPositive ? "▲" : "▼"}
                        {Math.abs(variation.percentage).toFixed(2)}%
                    </span>
                </div>
                <div className="flex flex-col items-start justify-start">
                    <span className="text-sm font-medium text-muted-foreground">
                        Total Invested
                    </span>
                    <span className="text-2xl font-bold">
                        <AnimatedNumber value={totalInvestedInPeriod} />€
                    </span>
                </div>
                <RealizedPnLDialog session={session}>
                    <div className="flex flex-col items-start justify-start cursor-pointer">
                        <span className="text-sm font-medium text-muted-foreground">
                            Realized PnL
                        </span>
                        <span
                            className={`text-2xl font-bold ${
                                totalPnLInPeriod >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                            }`}
                        >
                            <AnimatedNumber value={totalPnLInPeriod} />€
                        </span>
                    </div>
                </RealizedPnLDialog>
            </CardContent>
        </Card>
    )
}
