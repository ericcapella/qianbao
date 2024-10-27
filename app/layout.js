"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { metadata } from "./metadata"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <link rel="icon" href={metadata.icons.icon} />
                <Script
                    defer
                    data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
                    src="https://plausible.io/js/script.hash.outbound-links.pageview-props.tagged-events.js"
                />
                <Script id="plausible-setup">
                    {`
                    window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }
                    `}
                </Script>
            </head>
            <body className={inter.className}>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    )
}
