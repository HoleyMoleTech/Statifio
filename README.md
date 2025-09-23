# Statifio - Esports Statistics Platform

A modern, mobile-first esports statistics platform built with Next.js, providing real-time match data, team analytics, and comprehensive tournament insights.

## 🚀 Features

### Core Functionality
- **Real-time Live Matches** - Track ongoing matches across multiple esports titles
- **Team Analytics** - Comprehensive team statistics and performance metrics
- **Tournament Coverage** - Complete tournament data and match results
- **User Dashboard** - Personalized analytics and prediction tracking
- **Mobile-First Design** - Optimized for mobile devices with responsive layouts

### Supported Games
- League of Legends (LoL)
- Counter-Strike 2 (CS2)
- Dota 2

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: shadcn/ui component library
- **State Management**: React hooks with SWR for data fetching
- **Authentication**: Supabase Auth

### Backend
- **Database**: Supabase (PostgreSQL)
- **API Integration**: PandaScore API for esports data
- **Caching**: Multi-level caching strategy (in-memory + database)
- **Rate Limiting**: Intelligent request throttling

### Data Pipeline
\`\`\`
PandaScore API → Next.js API Routes → Services Layer → React Hooks → UI Components
                      ↓
                 Database Cache → Data Transformation → Component State
\`\`\`

## 📁 Project Structure

\`\`\`
statifio/
├── app/                          # Next.js App Router
│   ├── api/esports/             # API routes for esports data
│   ├── auth/                    # Authentication pages
│   ├── dashboard/               # User dashboard
│   ├── events/                  # Events and tournaments
│   ├── profile/                 # User profile
│   ├── stats/                   # Statistics pages
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── dashboard/               # Dashboard-specific components
│   ├── home/                    # Home page components
│   ├── layout/                  # Layout components (header, nav, etc.)
│   └── ui/                      # Reusable UI components
├── lib/                         # Utility libraries
│   ├── api/                     # API clients and types
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # Business logic services
│   └── supabase/                # Supabase configuration
└── scripts/                     # Utility scripts
\`\`\`

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database and auth)
- PandaScore API key (for esports data)

### Environment Variables
\`\`\`env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Database Configuration
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url

# PandaScore API Configuration
PANDASCORE_API_KEY=your_pandascore_api_key

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token

# Site Configuration
NEXT_PUBLIC_SITE_URL=your_site_url
\`\`\`

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd statifio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database setup scripts
npm run dev
# Then run the SQL scripts in the scripts/ folder

# Start development server
npm run dev
\`\`\`

## 📊 Data Pipeline

### API Integration
The application integrates with PandaScore API to fetch real-time esports data:

- **Rate Limiting**: 1000 requests/hour with intelligent throttling
- **Caching Strategy**: Multi-level caching (2-20 minutes TTL)
- **Error Handling**: Graceful fallbacks and retry logic
- **Data Transformation**: Consistent data format across components

### Database Schema
Key tables:
- `teams` - Team information and statistics
- `matches` - Match results and live data
- `tournaments` - Tournament and league information
- `users` - User accounts and preferences
- `user_predictions` - User prediction tracking

### Caching Strategy
1. **In-Memory Cache**: Fast access for frequently requested data
2. **Database Cache**: Persistent storage for API responses
3. **Component Cache**: React state management with SWR
4. **API Route Cache**: Next.js route-level caching

## 🎨 Design System

### Color Palette
- **Primary**: #15803d (green-700) - Main actions and highlights
- **Secondary**: #84cc16 - Accent color for secondary actions
- **Background**: #f0fdf4 - Light neutral background
- **Foreground**: #374151 - Primary text color

### Typography
- **Headlines**: Inter Bold
- **Body Text**: Inter Regular
- **Monospace**: JetBrains Mono

### Components
Built with shadcn/ui components:
- Mobile-responsive layouts
- Consistent spacing and typography
- Accessible design patterns
- Dark mode support

## 🔧 API Endpoints

### Internal API Routes
- `GET /api/esports/overview` - General esports overview
- `GET /api/esports/live-matches` - Current live matches
- `GET /api/esports/teams/[game]` - Teams by game
- `GET /api/esports/matches/[game]` - Matches by game

### Data Hooks
- `useEsportsOverview()` - General overview data
- `useLiveMatches()` - Live matches with polling
- `useGameStats(game)` - Game-specific statistics
- `useTopTeams(game)` - Top-ranked teams
- `useRecentMatches(game)` - Recent match results

## 🧪 Testing

### Data Pipeline Testing
\`\`\`bash
# Run data pipeline test
node scripts/test-data-pipeline.js
\`\`\`

### Component Testing
\`\`\`bash
# Run component tests
npm run test

# Run with coverage
npm run test:coverage
\`\`\`

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Setup
1. Create Supabase project
2. Run database migrations using the scripts in `/scripts` folder
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers

## 📈 Performance Optimization

### Caching Strategy
- API responses cached for 2-20 minutes based on data type
- Database queries optimized with indexes
- Component-level caching with SWR
- Image optimization with Next.js Image component

### Bundle Optimization
- Tree shaking for unused code elimination
- Dynamic imports for code splitting
- Optimized font loading
- Compressed assets

## 🔒 Security

### Authentication
- Supabase Auth with email/password
- Row Level Security (RLS) for data protection
- JWT token validation
- Secure session management

### API Security
- Rate limiting on external API calls
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation for integration details

---

Built with ❤️ using Next.js, Supabase, and PandaScore API
