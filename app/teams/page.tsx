import { Suspense } from "react"
import { TeamsContent } from "@/components/teams/teams-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Teams</h1>
        <p className="text-muted-foreground">Browse professional esports teams across different games</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        }
      >
        <TeamsContent />
      </Suspense>
    </div>
  )
}
