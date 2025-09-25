"use client"

import { useState, useEffect } from "react"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { AdminNav } from "@/components/admin/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Users, Trophy, Loader2, Filter } from "lucide-react"

interface Team {
  id: string
  name: string
  sport_type: string
  game_type: string | null
  region: string | null
  country: string | null
  founded_year: number | null
  logo_url: string | null
  description: string | null
  website_url: string | null
  player_count: number
  created_at: string
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [gameFilter, setGameFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    sport_type: "esports",
    game_type: "lol",
    region: "",
    country: "",
    founded_year: "",
    description: "",
    website_url: "",
  })

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/teams")
      if (!response.ok) throw new Error("Failed to fetch teams")
      const data = await response.json()
      setTeams(data.teams || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSport = sportFilter === "all" || team.sport_type === sportFilter
    const matchesGame = gameFilter === "all" || team.game_type === gameFilter
    return matchesSearch && matchesSport && matchesGame
  })

  const handleCreateTeam = async () => {
    try {
      const response = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          founded_year: formData.founded_year ? Number.parseInt(formData.founded_year) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to create team")

      await fetchTeams()
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating team:", error)
    }
  }

  const handleUpdateTeam = async () => {
    if (!editingTeam) return

    try {
      const response = await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          founded_year: formData.founded_year ? Number.parseInt(formData.founded_year) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update team")

      await fetchTeams()
      setEditingTeam(null)
      resetForm()
    } catch (error) {
      console.error("Error updating team:", error)
    }
  }

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return

    try {
      const response = await fetch(`/api/admin/teams/${deletingTeam.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete team")

      await fetchTeams()
      setDeletingTeam(null)
    } catch (error) {
      console.error("Error deleting team:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      sport_type: "esports",
      game_type: "lol",
      region: "",
      country: "",
      founded_year: "",
      description: "",
      website_url: "",
    })
  }

  const openEditDialog = (team: Team) => {
    setFormData({
      name: team.name,
      sport_type: team.sport_type,
      game_type: team.game_type || "lol",
      region: team.region || "",
      country: team.country || "",
      founded_year: team.founded_year?.toString() || "",
      description: team.description || "",
      website_url: team.website_url || "",
    })
    setEditingTeam(team)
  }

  const TeamForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Team Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter team name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Sport Type</label>
          <Select
            value={formData.sport_type}
            onValueChange={(value) => setFormData({ ...formData, sport_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="esports">eSports</SelectItem>
              <SelectItem value="football">Football</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.sport_type === "esports" && (
          <div>
            <label className="text-sm font-medium">Game</label>
            <Select
              value={formData.game_type}
              onValueChange={(value) => setFormData({ ...formData, game_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lol">League of Legends</SelectItem>
                <SelectItem value="csgo">CS:GO</SelectItem>
                <SelectItem value="dota2">Dota 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Region</label>
          <Input
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="e.g., North America"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Country</label>
          <Input
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="e.g., United States"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Founded Year</label>
        <Input
          type="number"
          value={formData.founded_year}
          onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
          placeholder="e.g., 2020"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Website URL</label>
        <Input
          value={formData.website_url}
          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief team description"
        />
      </div>
    </div>
  )

  return (
    <MobileLayout title="Team Management" showBack>
      <div className="space-y-6">
        <AdminNav />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground">Manage teams and rosters across all sports</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>Add a new team to the platform</DialogDescription>
              </DialogHeader>
              <TeamForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam}>Create Team</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="esports">eSports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="lol">LoL</SelectItem>
                    <SelectItem value="csgo">CS:GO</SelectItem>
                    <SelectItem value="dota2">Dota 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Teams ({filteredTeams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading teams...</span>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No teams found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{team.sport_type === "esports" ? "eSports" : "Football"}</Badge>
                          {team.game_type && <Badge variant="outline">{team.game_type.toUpperCase()}</Badge>}
                          {team.region && <span className="text-sm text-muted-foreground">{team.region}</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {team.player_count} players
                          </span>
                          {team.founded_year && <span>Founded {team.founded_year}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(team)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Team</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{team.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                setDeletingTeam(team)
                                handleDeleteTeam()
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>Update team information</DialogDescription>
            </DialogHeader>
            <TeamForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTeam(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTeam}>Update Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  )
}
