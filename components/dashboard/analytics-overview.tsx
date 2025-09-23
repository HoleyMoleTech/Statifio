"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Eye, Heart, BarChart3, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const analyticsData = {
  totalViews: 45672,
  totalFavorites: 234,
  matchesWatched: 89,
  predictionsCorrect: 67,
  weeklyGrowth: 12.5,
  monthlyGrowth: 8.3,
}

const topCategories = [
  { name: "League of Legends", views: 15420, percentage: 34, color: "bg-blue-500" },
  { name: "Premier League", views: 12890, percentage: 28, color: "bg-purple-600" },
  { name: "Counter-Strike 2", views: 8930, percentage: 20, color: "bg-orange-500" },
  { name: "Champions League", views: 5670, percentage: 12, color: "bg-blue-600" },
  { name: "Dota 2", views: 2762, percentage: 6, color: "bg-red-500" },
]

const recentActivity = [
  { action: "Viewed match", details: "T1 vs Gen.G (LoL)", time: "2 hours ago", type: "view" },
  { action: "Added favorite", details: "Manchester City", time: "5 hours ago", type: "favorite" },
  { action: "Correct prediction", details: "FaZe Clan victory", time: "1 day ago", type: "prediction" },
  { action: "Viewed tournament", details: "IEM Katowice", time: "2 days ago", type: "view" },
  { action: "Added favorite", details: "Real Madrid", time: "3 days ago", type: "favorite" },
]

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key Metrics Skeleton */}
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

      {/* Top Categories Skeleton */}
      <Card className="bg-card border">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-5 w-8" />
                </div>
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity Skeleton */}
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
  )
}

export function AnalyticsOverview() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Simulate API call delay

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <AnalyticsLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.totalViews.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+{analyticsData.weeklyGrowth}% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.totalFavorites}</p>
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-secondary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+{analyticsData.monthlyGrowth}% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matches Watched</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.matchesWatched}</p>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predictions</p>
                <p className="text-2xl font-bold text-foreground">{analyticsData.predictionsCorrect}%</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-green-600">Accuracy rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Top Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCategories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{category.views.toLocaleString()}</span>
                  <Badge variant="outline" className="text-xs">
                    {category.percentage}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${category.color}`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "view"
                      ? "bg-primary/10"
                      : activity.type === "favorite"
                        ? "bg-secondary/10"
                        : "bg-accent/10"
                  }`}
                >
                  {activity.type === "view" && <Eye className="h-4 w-4 text-primary" />}
                  {activity.type === "favorite" && <Heart className="h-4 w-4 text-secondary" />}
                  {activity.type === "prediction" && <BarChart3 className="h-4 w-4 text-accent" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
