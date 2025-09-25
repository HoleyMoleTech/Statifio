"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Users, Eye, TrendingUp, Clock, Zap, Target, Trophy, Star, Flame } from "lucide-react"
import { useLiveMatches, useEsportsOverview } from "@/lib/hooks/use-esports-data"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface RealTimeMetric {
  label: string
  value: number | string
  change?: number
  icon: React.ReactNode
  color: string
  trend?: "up" | "down" | "stable"
}

function RealTimeMetricCard({ metric }: { metric: RealTimeMetric }) {
  const getTrendColor = () => {
    switch (metric.trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="bg-card border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{metric.label}</p>
            <p className="text-xl font-bold text-foreground">{metric.value}</p>
            {metric.change !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-3 w-3 ${getTrendColor()}`} />
                <span className={`text-xs ${getTrendColor()}`}>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metric.color}`}>{metric.icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function LiveActivityFeed() {
  const [activities] = useState([
    { type: "match", message: "T1 vs Gen.G started", time: "2m ago", priority: "high" },
    { type: "prediction", message: "New prediction on FaZe vs NAVI", time: "5m ago", priority: "medium" },
    { type: "user", message: "1,247 users online", time: "8m ago", priority: "low" },
    { type: "match", message: "Cloud9 won against TSM", time: "12m ago", priority: "high" },
    { type: "achievement", message: "Reached 10k total predictions", time: "15m ago", priority: "medium" },
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "match":
        return <Activity className="h-4 w-4 text-red-500" />
      case "prediction":
        return <Target className="h-4 w-4 text-blue-500" />
      case "user":
        return <Users className="h-4 w-4 text-green-500" />
      case "achievement":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-muted"
    }
  }

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Live Activity Feed
          <Badge variant="destructive" className="text-xs animate-pulse">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 border-l-2 ${getPriorityColor(activity.priority)} hover:bg-muted/50 transition-colors`}
            >
              <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TopPerformers() {
  const performers = [
    { name: "League of Legends", score: 95, trend: "up", change: 5 },
    { name: "Counter-Strike 2", score: 88, trend: "up", change: 3 },
    { name: "Dota 2", score: 82, trend: "down", change: -2 },
    { name: "Valorant", score: 76, trend: "up", change: 8 },
  ]

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {performers.map((performer, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{performer.name}</span>
                <Badge variant={performer.trend === "up" ? "default" : "secondary"} className="text-xs">
                  {performer.trend === "up" ? "↗" : "↘"} {Math.abs(performer.change)}%
                </Badge>
              </div>
              <span className="text-sm font-bold text-foreground">{performer.score}</span>
            </div>
            <Progress value={performer.score} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RealTimeStats() {
  const { matches, loading: matchesLoading } = useLiveMatches()
  const { data: esportsData, loading: esportsLoading } = useEsportsOverview()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Mock real-time metrics - in production, these would come from live data
  const realTimeMetrics: RealTimeMetric[] = [
    {
      label: "Live Viewers",
      value: "12.4K",
      change: 8.5,
      icon: <Eye className="h-5 w-5" />,
      color: "bg-blue-100 dark:bg-blue-900/20",
      trend: "up",
    },
    {
      label: "Active Matches",
      value: matches?.length || 0,
      change: 12.3,
      icon: <Activity className="h-5 w-5" />,
      color: "bg-red-100 dark:bg-red-900/20",
      trend: "up",
    },
    {
      label: "Online Users",
      value: "2.8K",
      change: -2.1,
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-100 dark:bg-green-900/20",
      trend: "down",
    },
    {
      label: "Predictions/Min",
      value: "47",
      change: 15.7,
      icon: <Zap className="h-5 w-5" />,
      color: "bg-purple-100 dark:bg-purple-900/20",
      trend: "up",
    },
  ]

  if (matchesLoading || esportsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Live Time */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Real-Time Statistics</h3>
          <p className="text-sm text-muted-foreground">Last updated: {currentTime.toLocaleTimeString()}</p>
        </div>
        <Badge variant="destructive" className="animate-pulse">
          <Activity className="h-3 w-3 mr-1" />
          LIVE
        </Badge>
      </div>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {realTimeMetrics.map((metric, index) => (
          <RealTimeMetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Live Activity Feed and Top Performers */}
      <div className="grid grid-cols-1 gap-6">
        <LiveActivityFeed />
        <TopPerformers />
      </div>
    </div>
  )
}
