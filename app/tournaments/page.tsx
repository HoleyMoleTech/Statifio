import { Suspense } from "react"
import { TournamentsContent } from "@/components/tournaments/tournaments-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function TournamentsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tournaments</h1>
        <p className="text-muted-foreground">Explore ongoing and upcoming esports tournaments</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        }
      >
        <TournamentsContent />
      </Suspense>
    </div>
  )
}
