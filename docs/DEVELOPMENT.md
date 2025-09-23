# Development Guide

## Getting Started

### Local Development Environment

1. **Clone and Setup**
   \`\`\`bash
   git clone <repository-url>
   cd statifio
   npm install
   \`\`\`

2. **Environment Configuration**
   Copy `.env.example` to `.env.local` and configure:
   - Supabase credentials
   - Database connection strings
   - API keys

3. **Database Setup**
   \`\`\`bash
   # Run migrations
   npm run db:migrate
   
   # Seed development data
   npm run db:seed
   \`\`\`

## Architecture Deep Dive

### Component Architecture
\`\`\`
MobileLayout (Layout wrapper)
├── MobileHeader (Navigation header)
├── Main Content (Page-specific components)
└── MobileNav (Bottom navigation)
\`\`\`

### Data Flow
\`\`\`
User Action → React Hook → Service Layer → API Route → External API/Database
                ↓
Component State ← Data Transformation ← Response Processing
\`\`\`

### State Management
- **Local State**: React useState for component-specific data
- **Server State**: SWR for API data with caching
- **Global State**: React Context for user authentication
- **Form State**: React Hook Form for form management

## Development Workflow

### Adding New Features

1. **Create Components**
   \`\`\`bash
   # Create new component
   touch components/feature/new-component.tsx
   \`\`\`

2. **Add API Integration**
   \`\`\`bash
   # Create API route
   touch app/api/feature/route.ts
   
   # Add service method
   # Edit lib/services/feature-service.ts
   \`\`\`

3. **Create Hooks**
   \`\`\`bash
   # Add custom hook
   # Edit lib/hooks/use-feature-data.ts
   \`\`\`

### Code Style Guidelines

#### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper type annotations
- Avoid `any` type usage

#### React Components
\`\`\`tsx
// Preferred component structure
interface ComponentProps {
  title: string
  data: DataType[]
  onAction?: () => void
}

export function Component({ title, data, onAction }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState<StateType>()
  const { data: apiData, loading } = useCustomHook()
  
  // Event handlers
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies])
  
  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />
  if (!data) return <EmptyState />
  
  // Main render
  return (
    <div className="component-wrapper">
      {/* Component content */}
    </div>
  )
}
\`\`\`

#### CSS/Styling
- Use Tailwind CSS classes
- Prefer semantic design tokens
- Follow mobile-first responsive design
- Use consistent spacing scale

### Testing Strategy

#### Unit Tests
\`\`\`bash
# Test individual components
npm run test:unit

# Test with coverage
npm run test:coverage
\`\`\`

#### Integration Tests
\`\`\`bash
# Test API routes
npm run test:api

# Test data pipeline
node scripts/test-data-pipeline.js
\`\`\`

#### E2E Tests
\`\`\`bash
# Run end-to-end tests
npm run test:e2e
\`\`\`

## Debugging

### Common Issues

1. **API Rate Limiting**
   - Check PandaScore API usage
   - Verify rate limiting implementation
   - Use cached data when possible

2. **Database Connection**
   - Verify Supabase configuration
   - Check connection string format
   - Ensure RLS policies are correct

3. **Authentication Issues**
   - Verify Supabase Auth setup
   - Check redirect URLs
   - Ensure JWT tokens are valid

### Debug Tools

1. **Browser DevTools**
   - Network tab for API calls
   - Console for error messages
   - React DevTools for component state

2. **Server Logs**
   \`\`\`bash
   # View API logs
   npm run logs
   
   # Debug specific endpoint
   curl -X GET http://localhost:3000/api/esports/overview
   \`\`\`

3. **Database Debugging**
   - Use Supabase dashboard
   - Check query performance
   - Verify data integrity

## Performance Optimization

### Frontend Optimization
- Use React.memo for expensive components
- Implement proper key props for lists
- Optimize image loading with Next.js Image
- Use dynamic imports for code splitting

### Backend Optimization
- Implement proper caching strategies
- Optimize database queries
- Use connection pooling
- Monitor API response times

### Bundle Analysis
\`\`\`bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npm run deps:check
\`\`\`

## Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API keys and secrets secured
- [ ] Performance benchmarks met

### Deployment Process
1. Push to main branch
2. Vercel automatically deploys
3. Run post-deployment tests
4. Monitor application health

## Monitoring

### Application Monitoring
- Use Vercel Analytics for performance
- Monitor API response times
- Track error rates and user feedback
- Set up alerts for critical issues

### Database Monitoring
- Monitor query performance
- Track connection usage
- Set up backup schedules
- Monitor storage usage

## Contributing Guidelines

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Performance impact considered
- [ ] Security implications reviewed
