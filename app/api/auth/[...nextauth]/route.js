import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import clientPromise from "@/lib/mongodb"

const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const client = await clientPromise
                const usersCollection = client
                    .db("stocktracker")
                    .collection("users")
                const user = await usersCollection.findOne({
                    email: credentials.email,
                })

                if (
                    !user ||
                    !(await compare(credentials.password, user.password))
                ) {
                    return null
                }

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 180 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
            }
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id
            session.user.name = token.name
            session.user.email = token.email
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
export { authOptions }
