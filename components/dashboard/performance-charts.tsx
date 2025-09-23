"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Target } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const weeklyData = [
  { day: "Mon", views: 120, favorites: 8 },
  { day: "Tue", views: 150, favorites: 12 },
  { day: "Wed", views: 180, favorites: 15 },
  { day: "Thu", views: 140, favorites: 10 },
  { day: "Fri", views: 200, favorites: 18 },
  { day: "Sat", views: 250, favorites: 22 },
  { day: "Sun", views: 220, favorites: 20 },
]

const predictionStats = [
  { sport: "League of Legends", correct: 15, total: 20, accuracy: 75 },
  { sport: "Premier League", correct: 12, total: 18, accuracy: 67 },
  { sport: "Counter-Strike 2", correct: 8, total: 12, accuracy: 67 },
  { sport: "Champions League", correct: 5, total: 6, accuracy: 83 },
]

function PerformanceLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Weekly Activity Chart Skeleton */}
      <Card className="bg-card border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-3 w-8 mx-auto" />
                <div className="space-y-1">
                  <Skeleton className="h-16 w-4 mx-auto" />
                  <Skeleton className="h-3 w-6 mx-auto" />
                  <Skeleton className="h-8 w-4 mx-auto" />
                  <Skeleton className="h-3 w-4 mx-auto" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 border-t border">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Accuracy Skeleton */}
      <Card className="bg-card border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-36" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-5 w-8" />
                </div>
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Summary Skeleton */}
      <Card className="bg-card border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-4 w-28 mx-auto" />
            </div>
          </div>
          <div className="text-center p-4 bg-accent/5 rounded-lg">
            <Skeleton className="h-6 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function PerformanceCharts() {
  const [isLoading, setIsLoading] = useState(true)
  const maxViews = Math.max(...weeklyData.map((d) => d.views))
  const maxFavorites = Math.max(...weeklyData.map((d) => d.favorites))

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200) // Simulate API call delay

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <PerformanceLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Weekly Activity Chart */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((data, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-xs text-muted-foreground">{data.day}</div>
                <div className="space-y-1">
                  {/* Views Bar */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-4 bg-primary rounded-t"
                      style={{ height: `${(data.views / maxViews) * 60}px` }}
                    ></div>
                    <div className="text-xs text-primary font-medium">{data.views}</div>
                  </div>
                  {/* Favorites Bar */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-4 bg-secondary rounded-t"
                      style={{ height: `${(data.favorites / maxFavorites) * 30}px` }}
                    ></div>
                    <div className="text-xs text-secondary font-medium">{data.favorites}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 border-t border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span className="text-xs text-muted-foreground">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded"></div>
              <span className="text-xs text-muted-foreground">Favorites</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Accuracy */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prediction Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictionStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{stat.sport}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {stat.correct}/{stat.total}
                  </span>
                  <Badge
                    variant={stat.accuracy >= 75 ? "default" : stat.accuracy >= 60 ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {stat.accuracy}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stat.accuracy >= 75 ? "bg-green-500" : stat.accuracy >= 60 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${stat.accuracy}%` }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">73%</div>
              <div className="text-sm text-muted-foreground">Overall Accuracy</div>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <div className="text-2xl font-bold text-secondary">156</div>
              <div className="text-sm text-muted-foreground">Total Predictions</div>
            </div>
          </div>
          <div className="text-center p-4 bg-accent/5 rounded-lg">
            <div className="text-lg font-bold text-accent">Top 15%</div>
            <div className="text-sm text-muted-foreground">Among all users</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
