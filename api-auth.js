export async function fetchWithAuth(url, options = {}) {
    const headers = {
        ...options.headers,
        "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY,
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
}
