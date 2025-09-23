import { MobileLayout } from "@/components/layout/mobile-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <MobileLayout title="Dashboard" showSearch={false} showNotifications={true}>
      <div className="space-y-6">
        {/* Tabs skeleton */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
            <Skeleton className="h-9 rounded-md" />
            <Skeleton className="h-9 rounded-md" />
          </div>
        </div>

        {/* Key metrics skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts skeleton */}
        <Card className="bg-card border">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-3 w-8 mx-auto" />
                  <Skeleton className="h-16 w-4 mx-auto" />
                  <Skeleton className="h-3 w-6 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity skeleton */}
        <Card className="bg-card border">
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
