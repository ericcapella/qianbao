import Link from "next/link"
import Image from "next/image"

export default function Footer() {
    return (
        <footer className="py-8 px-4 border-t mt-16">
            <div className="max-w-[1150px] px-4 mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="text-center md:text-left">
                        <h4 className="font-semibold mb-4">Alternatives</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="https://ghostfol.io/?ref=qianbao.finance"
                                    className="text-base text-muted-foreground hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Ghostfolio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://www.portfolio-performance.info?ref=qianbao.finance"
                                    className="text-base text-muted-foreground hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Portfolio Performance
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://www.getquin.com/?ref=qianbao.finance"
                                    className="text-base text-muted-foreground hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Getquin
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://simpleportfolio.app/?ref=qianbao.finance"
                                    className="text-base text-muted-foreground hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    SimplePortfolio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://www.portseido.com/?ref=qianbao.finance"
                                    className="text-base text-muted-foreground hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Portseido
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="text-base text-muted-foreground hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cookie-policy"
                                    className="text-base text-muted-foreground hover:underline"
                                >
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms-of-service"
                                    className="text-base text-muted-foreground hover:underline"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/register"
                                    className="text-base text-muted-foreground hover:underline"
                                >
                                    Start Tracking Portfolio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/demo"
                                    className="text-base text-muted-foreground hover:underline"
                                >
                                    View Live Demo
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/login"
                                    className="text-base text-muted-foreground hover:underline"
                                >
                                    Login to your Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="text-center md:text-left">
                        <div className="flex justify-center md:justify-start mb-4">
                            <Image
                                src="/qianbao-logo.png"
                                alt="QianBao"
                                width={110}
                                height={22}
                            />
                        </div>
                        <p className="text-base text-muted-foreground mb-4">
                            Simple and privacy-first investment portfolio
                            tracker
                        </p>
                        <div className="flex justify-center md:justify-start items-center space-x-4 mb-4">
                            <Link
                                href="https://github.com/ericcapella/qianbao"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg
                                    className="w-6 h-6 text-muted-foreground hover:text-foreground"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                    />
                                </svg>
                            </Link>
                            <Link
                                href="https://ericcapella.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6 text-muted-foreground hover:text-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-base text-muted-foreground">
                        ©{" "}
                        {(() => {
                            const currentYear = new Date().getFullYear()
                            return currentYear === 2024
                                ? "2024"
                                : `2024-${currentYear}`
                        })()}{" "}
                        QianBao Finance
                    </p>
                </div>
            </div>
        </footer>
    )
}
