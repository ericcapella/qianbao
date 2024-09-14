import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatNumber(value, decimals = 2) {
    if (value == null) return "0" // Return '0' for null or undefined values
    return Number(value).toFixed(decimals).replace(".", ",")
}
