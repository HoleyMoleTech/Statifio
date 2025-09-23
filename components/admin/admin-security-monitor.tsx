"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, Eye, Key } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SecurityEvent {
  id: string
  event_type: string
  user_id: string
  ip_address: string
  user_agent: string
  details: any
  created_at: string
  user?: {
    email: string
    username: string
  }
}

export function AdminSecurityMonitor() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    failedLogins: 0,
    adminAccess: 0,
    suspiciousActivity: 0,
  })

  useEffect(() => {
    fetchSecurityEvents()
  }, [])

  const fetchSecurityEvents = async () => {
    try {
      const supabase = createClient()

      // Fetch recent security events (you would need to create this table)
      // For now, we'll simulate with user activity data
      const { data: activities } = await supabase
        .from("user_activity")
        .select(`
          *,
          users!inner(email, username)
        `)
        .order("created_at", { ascending: false })
        .limit(50)

      if (activities) {
        const events = activities.map((activity) => ({
          id: activity.id,
          event_type: activity.activity_type,
          user_id: activity.user_id,
          ip_address: "127.0.0.1", // Would come from actual security logs
          user_agent: "Browser", // Would come from actual security logs
          details: activity.activity_data,
          created_at: activity.created_at,
          user: activity.users,
        }))

        setSecurityEvents(events)

        // Calculate stats
        setStats({
          totalEvents: events.length,
          failedLogins: events.filter((e) => e.event_type === "login_failed").length,
          adminAccess: events.filter((e) => e.event_type === "admin_access").length,
          suspiciousActivity: events.filter((e) => e.event_type === "suspicious").length,
        })
      }
    } catch (error) {
      console.error("Error fetching security events:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login_failed":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "admin_access":
        return <Shield className="h-4 w-4 text-primary" />
      case "api_key_access":
        return <Key className="h-4 w-4 text-warning" />
      default:
        return <Eye className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "login_failed":
        return <Badge variant="destructive">Failed Login</Badge>
      case "admin_access":
        return <Badge variant="default">Admin Access</Badge>
      case "api_key_access":
        return <Badge variant="secondary">API Key Access</Badge>
      case "user_created":
        return <Badge variant="outline">User Created</Badge>
      default:
        return <Badge variant="outline">{eventType}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading security monitor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Failed Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.failedLogins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminAccess}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Suspicious Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.suspiciousActivity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {stats.failedLogins > 5 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            High number of failed login attempts detected. Consider reviewing security logs and implementing additional
            protection measures.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getEventIcon(event.event_type)}
                  <div>
                    <div className="flex items-center gap-2">
                      {getEventBadge(event.event_type)}
                      <span className="text-sm font-medium">{event.user?.email || "Unknown User"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(event.created_at)} • IP: {event.ip_address}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}

            {securityEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No security events recorded yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Enable Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts to enhance security.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Key className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Rotate API Keys Regularly</h4>
                <p className="text-sm text-muted-foreground">
                  Set expiration dates for API keys and rotate them periodically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Eye className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Monitor Admin Activity</h4>
                <p className="text-sm text-muted-foreground">
                  Regularly review admin access logs and user management activities.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
