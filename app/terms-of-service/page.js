import Image from "next/image"
import Link from "next/link"
import Footer from "../components/Footer"
import { Button } from "@/components/ui/button"
import Head from "next/head"

export default function TermsOfService() {
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
                <h1 className="text-2xl font-bold mt-8 mb-6">
                    Terms of Service
                </h1>
                <div className="policy-content w-full max-w-3xl">
                    <p className="mb-6">Last updated: 28/10/2024</p>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            1. Agreement to Terms
                        </h2>
                        <p className="text-base text-muted-foreground">
                            By accessing or using QianBao, you agree to be bound
                            by these Terms of Service and all applicable laws
                            and regulations. If you do not agree with any part
                            of these terms, you may not use our service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            2. Description of Service
                        </h2>
                        <p className="text-base text-muted-foreground">
                            QianBao is an investment portfolio tracking service
                            that allows users to input and monitor their
                            investment transactions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            3. User Accounts
                        </h2>
                        <p className="text-base text-muted-foreground">
                            You must be at least 18 years old to use QianBao.
                            You are responsible for maintaining the
                            confidentiality of your account and password.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            4. User Responsibilities
                        </h2>
                        <p className="text-base text-muted-foreground">
                            You are responsible for the accuracy of the data you
                            input into QianBao. We are not responsible for any
                            financial decisions you make based on the
                            information provided by our service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            5. Intellectual Property
                        </h2>
                        <p className="text-base text-muted-foreground">
                            The QianBao service and its original content,
                            features, and functionality are owned by Wioks
                            Global, S.L. (from now on "THE COMPANY") and are
                            protected by international copyright, trademark,
                            patent, trade secret, and other intellectual
                            property or proprietary rights laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            6. Termination
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We may terminate or suspend your account and bar
                            access to the service immediately, without prior
                            notice or liability, under our sole discretion, for
                            any reason whatsoever and without limitation,
                            including but not limited to a breach of the Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            7. Limitation of Liability
                        </h2>
                        <p className="text-base text-muted-foreground">
                            In no event shall THE COMPANY, nor its directors,
                            employees, partners, agents, suppliers, or
                            affiliates, be liable for any indirect, incidental,
                            special, consequential or punitive damages,
                            including without limitation, loss of profits, data,
                            use, goodwill, or other intangible losses, resulting
                            from your access to or use of or inability to access
                            or use the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            8. Disclaimer
                        </h2>
                        <p className="text-base text-muted-foreground">
                            Your use of the service is at your sole risk. The
                            service is provided on an "AS IS" and "AS AVAILABLE"
                            basis. The service is provided without warranties of
                            any kind, whether express or implied.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            9. Governing Law
                        </h2>
                        <p className="text-base text-muted-foreground">
                            These Terms shall be governed and construed in
                            accordance with the laws of Spain, without regard to
                            its conflict of law provisions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            10. Changes to Terms
                        </h2>
                        <p className="text-base text-muted-foreground">
                            We reserve the right to modify or replace these
                            Terms at any time. If a revision is material, we
                            will provide at least 30 days' notice prior to any
                            new terms taking effect.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            11. User Content
                        </h2>
                        <p className="text-base text-muted-foreground">
                            By submitting content to QianBao, you grant us a
                            worldwide, non-exclusive, royalty-free license to
                            use, reproduce, modify, and distribute that content
                            in connection with the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            12. Prohibited Uses
                        </h2>
                        <p className="text-base text-muted-foreground">
                            You may not use QianBao for any illegal purposes or
                            to conduct any unlawful activity, including, but not
                            limited to, fraud, embezzlement, money laundering,
                            or insider trading.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            13. Third-Party Links
                        </h2>
                        <p className="text-base text-muted-foreground">
                            QianBao may contain links to third-party websites or
                            services that are not owned or controlled by THE
                            COMPANY. We have no control over, and assume no
                            responsibility for, the content, privacy policies,
                            or practices of any third-party websites or
                            services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            14. Indemnification
                        </h2>
                        <p className="text-base text-muted-foreground">
                            You agree to indemnify and hold THE COMPANY and its
                            affiliates, officers, agents, employees, and
                            partners harmless from and against any and all
                            claims, liabilities, damages, losses, and expenses
                            arising out of or in any way connected with your
                            access to or use of QianBao.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            15. Severability
                        </h2>
                        <p className="text-base text-muted-foreground">
                            If any provision of these Terms is held to be
                            unenforceable or invalid, such provision will be
                            changed and interpreted to accomplish the objectives
                            of such provision to the greatest extent possible
                            under applicable law, and the remaining provisions
                            will continue in full force and effect.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            16. Entire Agreement
                        </h2>
                        <p className="text-base text-muted-foreground">
                            These Terms constitute the entire agreement between
                            you and THE COMPANY regarding your use of QianBao
                            and supersede all prior and contemporaneous written
                            or oral agreements between you and THE COMPANY.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">17. Waiver</h2>
                        <p className="text-base text-muted-foreground">
                            The failure of THE COMPANY to enforce any right or
                            provision of these Terms will not be considered a
                            waiver of those rights. The waiver of any such right
                            or provision will be effective only if in writing
                            and signed by a duly authorized representative of
                            THE COMPANY.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-l font-normal mb-3">
                            18. Contact Us
                        </h2>
                        <p className="text-base text-muted-foreground">
                            If you have any questions about these Terms, please
                            contact us at:
                        </p>
                        <p className="text-base text-muted-foreground mt-2">
                            Wioks Global, S.L.
                            <br />
                            Cl. Sant Josep 132-134 P-I.El Pla, 08980 Sant Feliu
                            de Llobregat (Barcelona)
                            <br />
                            Email: info (at) wioks .com
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
