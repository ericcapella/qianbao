import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatNumber(value, decimals = 2) {
    if (value == null) return "0" // Return '0' for null or undefined values
    return Number(value).toFixed(decimals).replace(".", ",")
}

export function formatDate(dateString) {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export function formatShares(value) {
    if (value == null) return "0"
    const formattedValue = Number(value).toFixed(6)
    const [integerPart, decimalPart] = formattedValue.split(".")
    const trimmedDecimalPart = decimalPart.replace(/0+$/, "") // Remove trailing zeros
    return trimmedDecimalPart
        ? `${integerPart},${trimmedDecimalPart}`
        : integerPart
}
