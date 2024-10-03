import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AuthButtons from "./components/AuthButtons"

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex justify-between items-center py-4 px-4 lg:px-8 max-w-[1150px] mx-auto w-full">
                <div>
                    <Link href="/">
                        <Image
                            src="/qianbao-logo.png"
                            alt="QianBao"
                            width={110}
                            height={22}
                        />
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <AuthButtons />
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-4 lg:px-8 max-w-[1150px] mx-auto w-full text-center">
                <h1 className="text-4xl font-bold mb-4">
                    Track all your investment portfolio in the same place
                </h1>
                <p className="text-xl mb-8 text-muted-foreground max-w-2xl">
                    Add and track any asset including stocks, ETFs, funds, DeFi
                    investments, real estate, angel investments, luxury
                    collectibles, art and commodities and more.
                </p>
                <div className="flex space-x-4">
                    <Button asChild>
                        <Link href="/register">Start Tracking Portfolio</Link>
                    </Button>
                    <Button variant="outline">View Demo</Button>
                </div>
                <div className="mt-12 w-full max-w-3xl">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">
                            Hero Image Placeholder
                        </span>
                    </div>
                </div>
            </main>
        </div>
    )
}
