"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Trophy,
  Target,
  Zap,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  RefreshCw,
  Clock,
} from "lucide-react"
import { useEsportsOverview, useLiveMatches, useGameStats } from "@/lib/hooks/use-esports-data"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  matches: {
    label: "Matches",
    color: "hsl(var(--chart-2))",
  },
  predictions: {
    label: "Predictions",
    color: "hsl(var(--chart-3))",
  },
  accuracy: {
    label: "Accuracy",
    color: "hsl(var(--chart-4))",
  },
  engagement: {
    label: "Engagement",
    color: "hsl(var(--chart-5))",
  },
}

// Mock data for demonstration - will be replaced with real data
const weeklyAnalytics = [
  { day: "Mon", views: 1200, matches: 15, predictions: 8, accuracy: 75 },
  { day: "Tue", views: 1500, matches: 18, predictions: 12, accuracy: 83 },
  { day: "Wed", views: 1800, matches: 22, predictions: 15, accuracy: 67 },
  { day: "Thu", views: 1400, matches: 16, predictions: 10, accuracy: 90 },
  { day: "Fri", views: 2200, matches: 28, predictions: 20, accuracy: 85 },
  { day: "Sat", views: 2800, matches: 35, predictions: 25, accuracy: 72 },
  { day: "Sun", views: 2400, matches: 30, predictions: 22, accuracy: 77 },
]

const gameDistribution = [
  { name: "League of Legends", value: 35, color: "#3b82f6" },
  { name: "Counter-Strike 2", value: 28, color: "#8b5cf6" },
  { name: "Dota 2", value: 20, color: "#f59e0b" },
  { name: "Valorant", value: 12, color: "#ef4444" },
  { name: "Others", value: 5, color: "#6b7280" },
]

const performanceMetrics = [
  { metric: "Total Views", value: 45672, change: 12.5, trend: "up" },
  { metric: "Active Users", value: 2834, change: 8.3, trend: "up" },
  { metric: "Predictions Made", value: 1247, change: -2.1, trend: "down" },
  { metric: "Accuracy Rate", value: 78.5, change: 5.2, trend: "up" },
]

function MetricCard({ metric, value, change, trend }: any) {
  const isPositive = trend === "up"
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className="bg-card border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{metric}</p>
            <p className="text-2xl font-bold text-foreground">
              {typeof value === "number" && value > 1000 ? value.toLocaleString() : value}
              {metric.includes("Rate") && "%"}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isPositive ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
            }`}
          >
            <TrendIcon className={`h-5 w-5 ${isPositive ? "text-green-600" : "text-red-600"}`} />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <TrendIcon className={`h-3 w-3 ${isPositive ? "text-green-600" : "text-red-600"}`} />
          <span className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {Math.abs(change)}% from last week
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function LiveMatchesWidget() {
  const { matches, loading, error } = useLiveMatches()

  if (loading) {
    return (
      <Card className="bg-card border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-500" />
          Live Matches
          <Badge variant="destructive" className="text-xs animate-pulse">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {matches.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No live matches at the moment</p>
          </div>
        ) : (
          matches.slice(0, 3).map((match, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {match.opponents?.[0]?.opponent?.name || "Team A"} vs{" "}
                    {match.opponents?.[1]?.opponent?.name || "Team B"}
                  </p>
                  <p className="text-xs text-muted-foreground">{match.videogame?.name || "Unknown Game"}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {match.status || "Live"}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card border">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-64" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function LiveAnalyticsDashboard() {
  const { data: esportsData, loading: esportsLoading } = useEsportsOverview()
  const [selectedGame, setSelectedGame] = useState("lol")
  const { stats: gameStats, loading: gameLoading } = useGameStats(selectedGame)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (esportsLoading) {
    return <AnalyticsLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Live Analytics</h2>
          <p className="text-sm text-muted-foreground">Real-time esports data and insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {performanceMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Live Matches Widget */}
      <LiveMatchesWidget />

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <LineChartIcon className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Games
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Weekly Activity Chart */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={weeklyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                  <Bar dataKey="matches" fill="var(--color-matches)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Prediction Accuracy */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5" />
                Prediction Accuracy Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={weeklyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--color-accuracy)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-accuracy)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6 space-y-6">
          {/* Engagement Trends */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Engagement Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <AreaChart data={weeklyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke="var(--color-views)"
                    fill="var(--color-views)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="predictions"
                    stackId="1"
                    stroke="var(--color-predictions)"
                    fill="var(--color-predictions)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Performance Comparison */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance vs Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={weeklyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="predictions"
                    stroke="var(--color-predictions)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-predictions)", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--color-accuracy)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-accuracy)", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-6 space-y-6">
          {/* Game Distribution */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Game Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartContainer config={chartConfig} className="h-64">
                  <PieChart>
                    <Pie
                      data={gameDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {gameDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>

                <div className="space-y-3">
                  {gameDistribution.map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: game.color }} />
                        <span className="text-sm font-medium text-foreground">{game.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {game.value}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Games */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Performing Games
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameDistribution.slice(0, 3).map((game, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{game.name}</p>
                      <p className="text-xs text-muted-foreground">{game.value}% of total views</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{(game.value * 456).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
