import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatNumber(value, decimals = 2) {
    return value.toFixed(decimals).replace(".", ",")
}
