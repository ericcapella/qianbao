import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
    return (
        <div>
            <header className="flex justify-between items-center py-4 mx-auto px-4 lg:max-w-[1150px]">
                <Skeleton className="h-[22px] w-[110px]" />
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-[140px]" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </header>
            <main className="mx-auto px-4 lg:max-w-[1150px]">
                <Skeleton className="w-full h-[300px] my-4" />
                <Skeleton className="w-full h-[400px] my-4" />
                <Skeleton className="w-full h-[300px] my-4" />
            </main>
        </div>
    )
}
