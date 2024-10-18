import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AuthButtons from "./components/AuthButtons"
import Footer from "./components/Footer"

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex justify-between items-center py-4 px-4 lg:max-w-[1150px] mx-auto w-full">
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
                <h1 className="text-5xl font-bold mt-8 mb-5">
                    Simple and privacy-first <br />
                    investment portfolio tracker
                </h1>
                <h2 className="text-3xl font-semibold mb-5 text-muted-foreground">
                    All your assets in one place
                </h2>
                <div className="flex space-x-4 mb-8">
                    <Button asChild>
                        <Link href="/register">Start Tracking Portfolio</Link>
                    </Button>
                    <Button variant="outline">View Demo</Button>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-center md:items-center space-y-4 md:space-y-0 md:space-x-8">
                    <div className="flex items-center justify-center w-full md:w-auto">
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                        <span>Securely encrypted</span>
                    </div>
                    <div className="flex items-center justify-center w-full md:w-auto">
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                        <span>Stocks, ETFs, Crypto and more</span>
                    </div>
                    <div className="flex items-center justify-center w-full md:w-auto">
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                        <span>Easy to set up</span>
                    </div>
                </div>
                <div className="mt-12 w-full max-w-3xl">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">
                            Hero Image Placeholder
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-4xl">
                    <div className="text-left">
                        <div className="w-16 h-16 bg-muted rounded-lg mb-4 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-8 h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">
                            All your investments in one place
                        </h3>
                        <p className="text-base text-muted-foreground">
                            Get a perfect overview of all your investments in
                            one place. Easily see your asset allocation and how
                            well each asset performs.
                        </p>
                    </div>
                    <div className="text-left">
                        <div className="w-16 h-16 bg-muted rounded-lg mb-4 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-8 h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">
                            Real-time net worth tracking
                        </h3>
                        <p className="text-base text-muted-foreground">
                            Monitor your aggregated net worth in real-time, with
                            live asset value updates, providing an instant
                            snapshot of your financial status.
                        </p>
                    </div>
                    <div className="text-left">
                        <div className="w-16 h-16 bg-muted rounded-lg mb-4 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-8 h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">
                            Maximum data protection
                        </h3>
                        <p className="text-base text-muted-foreground">
                            Open-source code and robust security measures ensure
                            maximum protection for your financial data. Your
                            sensitive information remains private and secure,
                            accessible only to you.
                        </p>
                    </div>
                    <div className="text-left">
                        <div className="w-16 h-16 bg-muted rounded-lg mb-4 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-8 h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">
                            Effortless performance tracking
                        </h3>
                        <p className="text-base text-muted-foreground">
                            Track portfolio performance effortlessly. Our
                            intuitive dashboards offer clear insights into
                            investment growth. Analyze trends to make informed
                            decisions and optimize your strategy.
                        </p>
                    </div>
                </div>
                <div className="w-full max-w-4xl py-12 rounded-lg text-center flex">
                    <div className="w-1/4 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-6xl font-bold">钱包</span>
                    </div>
                    <div className="w-3/4 pl-8 text-left">
                        <h3 className="text-2xl font-bold mb-4">
                            Why QianBao?
                        </h3>
                        <p className="text-base text-muted-foreground">
                            QianBao (钱包) means "wallet" in Chinese. A simple
                            and straightforward name for this project, a
                            software that helps you keep track of your financial
                            assets, just like a wallet does for your cash and
                            cards.{" "}
                            <Link
                                href="/register"
                                className="underline whitespace-nowrap"
                            >
                                Start Tracking Portfolio →
                            </Link>
                        </p>
                    </div>
                </div>
                <div className=" w-full max-w-4xl p-12 rounded-lg text-center">
                    <h3 className="text-3xl font-bold mb-4">
                        Proudly open-source
                    </h3>
                    <p className="text-base text-muted-foreground mb-6">
                        The source code is available on GitHub - feel free to
                        read, review, or contribute to it however you want!
                    </p>
                    <Button asChild>
                        <Link
                            href="https://github.com/ericcapella/qianbao"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg
                                className="w-6 h-6 mr-2"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                />
                            </svg>
                            Star on GitHub
                        </Link>
                    </Button>
                </div>
                <div className="w-full max-w-4xl mt-12 p-12 bg-muted rounded-lg text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient
                                    id="gradient"
                                    x1="0%"
                                    y1="100%"
                                    x2="100%"
                                    y2="0%"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#22c55e"
                                        stopOpacity="0.5"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#22c55e"
                                        stopOpacity="0.5"
                                    />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,80 C10,75 20,85 30,70 S40,60 50,65 S60,50 70,55 C75,57 80,59 85,62 C90,65 94,62 96,58 C98,54 99,45 100,40 L100,100 L0,100 Z"
                                fill="url(#gradient)"
                            />
                            <path
                                d="M0,80 C10,75 20,85 30,70 S40,60 50,65 S60,50 70,55 C75,57 80,59 85,62 C90,65 94,62 96,58 C98,54 99,45 100,40"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-4">
                            Start tracking your investments
                        </h3>
                        <p className="text-base text-muted-foreground mb-8">
                            Gain clear insights into your investments, track
                            your portfolio's performance in real-time, and
                            empower yourself to make smarter financial
                            decisions.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button asChild>
                                <Link href="/register">
                                    Start Tracking Portfolio
                                </Link>
                            </Button>
                            <Button variant="outline">View Demo</Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
