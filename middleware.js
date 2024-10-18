import { NextResponse } from "next/server"

export function middleware(request) {
    const apiKey = request.headers.get("x-api-key")
    const isApiRoute = request.nextUrl.pathname.startsWith("/api")
    const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth")
    const isRegisterRoute = request.nextUrl.pathname === "/api/register"

    if (
        isApiRoute &&
        !isAuthRoute &&
        !isRegisterRoute &&
        apiKey !== process.env.API_SECRET_KEY
    ) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        })
    }

    return NextResponse.next()
}

export const config = {
    matcher: "/api/:path*",
}
