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
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
