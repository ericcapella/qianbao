import Image from "next/image"
import Link from "next/link"
import Footer from "../components/Footer"
import { Button } from "@/components/ui/button"
import Head from "next/head"

export default function PrivacyPolicy() {
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
                <h1 className="text-2xl font-bold mt-8 mb-6">Privacy Policy</h1>
                <div className="policy-content w-full max-w-3xl">
                    <p className="mb-6">Last updated: 28/10/2024</p>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            1. Introduction
                        </h2>
                        <p className="text-base text-muted-foreground">
                            This Privacy Policy explains how we collect, use,
                            disclose, and safeguard your information when you
                            use QianBao.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            2. Information We Collect
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We collect the following information:
                        </p>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-2">
                            <li>
                                Name and email address when you register for an
                                account.
                            </li>
                            <li>
                                Investment transaction data that you input into
                                the application.
                            </li>
                            <li>
                                Usage data collected through analytics tools
                                (Plausible Analytics and PostHog).
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            3. How We Use Your Information
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We use your information to:
                        </p>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-2">
                            <li>Provide and maintain our service.</li>
                            <li>Notify you about changes to our service.</li>
                            <li>
                                Allow you to participate in interactive features
                                of our service.
                            </li>
                            <li>Provide customer support.</li>
                            <li>Monitor the usage of our service.</li>
                            <li>
                                Detect, prevent and address technical issues.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            4. Data Sharing and Disclosure
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We may share your information with:
                        </p>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-2">
                            <li>
                                Service providers (Vercel for hosting, MongoDB
                                for database services).
                            </li>
                            <li>
                                Analytics providers (Plausible Analytics and
                                PostHog).
                            </li>
                            <li>
                                Law enforcement agencies, regulatory bodies, or
                                others if required by law.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            5. Data Security
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We implement appropriate technical and
                            organizational measures to protect your data.
                            However, no method of transmission over the Internet
                            or electronic storage is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            6. Your Data Protection Rights
                        </h2>
                        <p className="text-base text-muted-foreground">
                            Depending on your location, you may have certain
                            rights regarding your personal data, such as the
                            right to access, correct, or delete your data. To
                            exercise these rights, please contact us using the
                            information provided in the Terms of Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            7. Children's Privacy
                        </h2>
                        <p className="text-base text-muted-foreground">
                            Our service is not intended for use by anyone under
                            the age of 18. We do not knowingly collect personal
                            information from children under 18.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            8. Changes to This Privacy Policy
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We may update our Privacy Policy from time to time.
                            We will notify you of any changes by posting the new
                            Privacy Policy on this page and updating the "Last
                            updated" date.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            9. Contact Us
                        </h2>
                        <p className="text-base text-muted-foreground">
                            For more information, please refer to our{" "}
                            <Link href="/terms-of-service">
                                Terms of Service
                            </Link>
                            .
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
