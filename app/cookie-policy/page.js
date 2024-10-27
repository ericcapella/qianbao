import Image from "next/image"
import Link from "next/link"
import Footer from "../components/Footer"
import { Button } from "@/components/ui/button"
import Head from "next/head"

export default function CookiePolicy() {
    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
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
                    <Button variant="outline" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Register</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-4 lg:px-8 max-w-[1150px] mx-auto w-full">
                <h1 className="text-2xl font-bold mt-8 mb-6">Cookie Policy</h1>
                <div className="policy-content w-full max-w-3xl">
                    <p className="mb-6">Last updated: 28/10/2024</p>

                    <section className="mb-8">
                        <p className="text-base text-muted-foreground">
                            QianBao does not use any tracking cookies. We
                            prioritize your privacy and minimize data
                            collection.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            1. Session and analytics
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We use the following technologies:
                        </p>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-2">
                            <li>
                                Session Cookie: We use a secure, HTTP-only
                                cookie to maintain your login session. This
                                cookie is used to keep you logged in and does
                                not track your activities in the app or across
                                other websites. You can remove it by simply
                                logging out.
                            </li>
                            <li>
                                Cookie-less Analytics: We use privacy-friendly
                                analytics tools that do not use cookies and do
                                not collect personal data. These tools help us
                                understand how our website is being used without
                                identifying individual users.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            2. Changes to This Cookie Policy
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We may update this Cookie Policy from time to time.
                            We will notify you of any changes by posting the new
                            Cookie Policy on this page and updating the "Last
                            updated" date.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            3. Contact Us
                        </h2>
                        <p className="text-base text-muted-foreground">
                            If you have any questions, please refer to our{" "}
                            <Link href="/terms-of-service">
                                Terms of Service
                            </Link>{" "}
                            page for contact information.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
