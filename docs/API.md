# API Documentation

## Overview

Statifio provides a comprehensive API for accessing esports data, user analytics, and platform features. The API is built with Next.js API routes and integrates with PandaScore for real-time esports data.

## Base URL
\`\`\`
Production: https://your-domain.com/api
Development: http://localhost:3000/api
\`\`\`

## Authentication

Most endpoints require authentication via Supabase Auth. Include the JWT token in the Authorization header:

\`\`\`bash
Authorization: Bearer <jwt_token>
\`\`\`

## Rate Limiting

- **Internal API**: 100 requests per minute per IP
- **External PandaScore API**: 1000 requests per hour (shared across all users)

## Endpoints

### Esports Data

#### GET /api/esports/overview
Get general esports overview with game statistics and live matches.

**Response:**
\`\`\`json
{
  "games": [
    {
      "id": "lol",
      "name": "League of Legends",
      "shortName": "LoL",
      "color": "bg-blue-500",
      "stats": {
        "activeMatches": 15,
        "totalPlayers": 250,
        "tournaments": 8,
        "avgViewers": "2.4M"
      }
    }
  ],
  "liveMatches": [
    {
      "id": 12345,
      "date": "2024-01-15T14:30:00Z",
      "status": "running",
      "teams": {
        "team1": {
          "name": "T1",
          "acronym": "T1",
          "image_url": "/team-logo.png",
          "score": 1
        },
        "team2": {
          "name": "Gen.G",
          "acronym": "GEN",
          "image_url": "/team-logo.png",
          "score": 0
        }
      },
      "tournament": {
        "name": "LCK Spring 2024",
        "league": "LCK"
      },
      "videogame": "League of Legends"
    }
  ],
  "totalLiveMatches": 23,
  "metadata": {
    "fetchedAt": "2024-01-15T14:35:00Z",
    "apiCallsUsed": 6,
    "cached": false,
    "source": "pandascore"
  }
}
\`\`\`

#### GET /api/esports/live-matches
Get current live matches across all supported games.

**Response:**
\`\`\`json
[
  {
    "id": 12345,
    "date": "2024-01-15T14:30:00Z",
    "status": "running",
    "teams": {
      "team1": {
        "name": "Team Name",
        "acronym": "TN",
        "image_url": "/logo.png",
        "score": 1
      },
      "team2": {
        "name": "Opponent",
        "acronym": "OPP",
        "image_url": "/logo.png",
        "score": 0
      }
    },
    "tournament": {
      "name": "Tournament Name",
      "league": "League Name"
    },
    "videogame": "League of Legends"
  }
]
\`\`\`

#### GET /api/esports/teams/[game]
Get teams for a specific game.

**Parameters:**
- `game` (string): Game identifier (lol, cs2, dota2)
- `limit` (number, optional): Number of teams to return (default: 10)

**Response:**
\`\`\`json
[
  {
    "rank": 1,
    "team": {
      "id": 123,
      "name": "T1",
      "acronym": "T1",
      "image_url": "/t1-logo.png",
      "location": "South Korea"
    },
    "wins": 15,
    "losses": 3,
    "winRate": 83,
    "recentForm": ["W", "W", "L", "W", "W"]
  }
]
\`\`\`

#### GET /api/esports/matches/[game]
Get recent matches for a specific game.

**Parameters:**
- `game` (string): Game identifier (lol, cs2, dota2)
- `limit` (number, optional): Number of matches to return (default: 10)

**Response:**
\`\`\`json
[
  {
    "id": 12345,
    "date": "2024-01-15T14:30:00Z",
    "status": "finished",
    "teams": {
      "team1": {
        "name": "T1",
        "acronym": "T1",
        "image_url": "/t1-logo.png",
        "score": 2
      },
      "team2": {
        "name": "Gen.G",
        "acronym": "GEN",
        "image_url": "/gen-logo.png",
        "score": 1
      }
    },
    "tournament": {
      "name": "LCK Spring 2024",
      "league": "LCK"
    },
    "videogame": "League of Legends"
  }
]
\`\`\`

### User Data (Protected Routes)

#### GET /api/user/profile
Get current user profile information.

**Headers:**
\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

**Response:**
\`\`\`json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "username",
  "created_at": "2024-01-01T00:00:00Z",
  "preferences": {
    "favoriteGames": ["lol", "cs2"],
    "notifications": true,
    "theme": "light"
  },
  "stats": {
    "totalViews": 1234,
    "favoriteTeams": 5,
    "predictionsCorrect": 67
  }
}
\`\`\`

#### PUT /api/user/profile
Update user profile information.

**Headers:**
\`\`\`
Authorization: Bearer <jwt_token>
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "username": "new_username",
  "preferences": {
    "favoriteGames": ["lol", "dota2"],
    "notifications": false,
    "theme": "dark"
  }
}
\`\`\`

#### GET /api/user/analytics
Get user analytics and activity data.

**Headers:**
\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

**Response:**
\`\`\`json
{
  "totalViews": 45672,
  "totalFavorites": 234,
  "matchesWatched": 89,
  "predictionsCorrect": 67,
  "weeklyGrowth": 12.5,
  "monthlyGrowth": 8.3,
  "topCategories": [
    {
      "name": "League of Legends",
      "views": 15420,
      "percentage": 34
    }
  ],
  "recentActivity": [
    {
      "action": "Viewed match",
      "details": "T1 vs Gen.G (LoL)",
      "time": "2 hours ago",
      "type": "view"
    }
  ]
}
\`\`\`

## Error Handling

All API endpoints return consistent error responses:

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
\`\`\`

### Common Error Codes

- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Data Types

### Match Status
- `not_started`: Match hasn't begun
- `running`: Match is currently live
- `finished`: Match has ended

### Game Identifiers
- `lol`: League of Legends
- `cs2`: Counter-Strike 2
- `dota2`: Dota 2

## Caching

API responses are cached with the following TTL:
- Overview data: 5 minutes
- Live matches: 2 minutes
- Team data: 15 minutes
- Match history: 10 minutes
- User data: No caching (always fresh)

## WebSocket Support (Future)

Real-time updates for live matches will be available via WebSocket:

\`\`\`javascript
const ws = new WebSocket('wss://your-domain.com/ws/live-matches')
ws.onmessage = (event) => {
  const matchUpdate = JSON.parse(event.data)
  // Handle live match updates
}
\`\`\`

## SDK Usage

For easier integration, use the provided JavaScript SDK:

\`\`\`javascript
import { StatifioAPI } from '@statifio/sdk'

const api = new StatifioAPI({
  baseURL: 'https://your-domain.com/api',
  token: 'your-jwt-token'
})

// Get live matches
const liveMatches = await api.esports.getLiveMatches()

// Get user analytics
const analytics = await api.user.getAnalytics()
\`\`\`

## Examples

### Fetch Live Matches
\`\`\`javascript
const response = await fetch('/api/esports/live-matches')
const liveMatches = await response.json()

liveMatches.forEach(match => {
  console.log(`${match.teams.team1.name} vs ${match.teams.team2.name}`)
})
\`\`\`

### Update User Preferences
\`\`\`javascript
const response = await fetch('/api/user/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferences: {
      favoriteGames: ['lol', 'cs2'],
      notifications: true
    }
  })
})
\`\`\`

## Support

For API support:
- Check the status page for service availability
- Review error codes and messages
- Contact support with request/response details
- Use the test endpoints for debugging
