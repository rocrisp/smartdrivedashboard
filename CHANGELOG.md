# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-05-13

### Iteration 11: Performance & Polish

#### Added
- Next.js image optimization with AVIF and WebP formats
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Compression enabled for better performance
- Enhanced landing page with feature showcase
- Animated hero section with gradient background
- Feature cards highlighting key capabilities

#### Changed
- Improved landing page design with modern gradients
- Better visual hierarchy and spacing
- Enhanced sign-in button with hover effects

## [0.1.0] - 2026-05-13

### Iteration 10: Skeleton Loaders & Documentation

#### Added
- Comprehensive skeleton loader components
- Database seeding script (prisma/seed.ts)
- db:seed npm script for test data
- Enhanced README with categorized features
- Updated project structure documentation

#### Changed
- Replaced loading spinners with skeleton loaders
- Improved loading UX across all components
- Better content-aware placeholders

### Iteration 9: Notifications & Accessibility

#### Added
- Toast notification system with 4 types (success, error, warning, info)
- Custom 404 not-found page
- Enhanced error page with error ID tracking
- ARIA labels on all interactive elements
- Skip to main content link
- Screen reader utility classes
- Keyboard navigation improvements

#### Changed
- Improved error handling throughout app
- Better accessibility compliance (WCAG)
- Enhanced screen reader support

### Iteration 8: Mobile & Functionality

#### Added
- Footer component with links and resources
- Mobile touch target optimizations
- iOS-specific improvements
- Functional quick actions (refresh, export, settings, Google account)
- Data export feature (JSON download)

#### Changed
- Improved mobile font sizes and readability
- Better responsive layout structure
- Enhanced button animations

### Iteration 7: Statistics & Visualization

#### Added
- StatsOverview component with real-time data
- /api/stats endpoint for user statistics
- Account age tracking and display
- Activity count tracking
- Session count display

#### Changed
- Dashboard now shows dynamic statistics
- Better data visualization

### Iteration 6: Activity Tracking & Navigation

#### Added
- Activity model in database schema
- /api/activities endpoints (GET, POST)
- Automatic activity logging on sign-in
- Reusable Header component with navigation
- Active state highlighting for nav links

#### Changed
- ActivityFeed now fetches real data from database
- Removed duplicate header code across pages
- Improved mobile navigation

### Iteration 5: API & Settings

#### Added
- Health check endpoint (/api/health)
- Status endpoint (/api/status)
- Enhanced app metadata and SEO tags
- PWA manifest.json
- Application logo (SVG)
- Comprehensive settings page
- Profile information display
- Notification settings UI
- Account deletion danger zone

#### Changed
- Better metadata for social sharing
- Improved settings organization

### Iteration 4: Production Ready

#### Added
- Comprehensive deployment guide (DEPLOYMENT.md)
- Production deployment instructions for multiple platforms
- Production checklist
- Monitoring and optimization recommendations

#### Security
- Fixed ESLint errors for production build
- Verified successful production build

### Iteration 3: Developer Experience

#### Added
- Automated setup script (setup.sh)
- Environment validation script (check-env.js)
- Safe development mode (dev:safe)
- CONTRIBUTING.md guidelines
- MIT LICENSE
- CHANGELOG.md (this file)
- New npm scripts (setup, check:env, dev:safe, db:reset)

#### Changed
- Enhanced README with troubleshooting
- Better project organization

### Iteration 2: UI Enhancement

#### Added
- Loading states and error boundaries
- Reusable UI components (Card, Button)
- Activity Feed widget
- Quick Actions widget
- Skeleton loading states

#### Changed
- Updated to Next.js 15 and React 19
- Enhanced dashboard with modular components
- Improved dark mode support

#### Security
- Fixed 5 security vulnerabilities
- Updated dependencies to latest versions

### Iteration 1: Initial Release

#### Added
- Next.js 14 project setup with TypeScript
- Google OAuth authentication via NextAuth.js
- PostgreSQL database with Prisma ORM
- Tailwind CSS styling
- Responsive dashboard interface
- Dark mode support
- User profile display
- Session management
- Protected routes with middleware
- Environment configuration
- Basic documentation

## Version History

- **0.2.0** - Iterations 9-11: Notifications, accessibility, performance
- **0.1.0** - Iterations 1-8: Core features and foundation

---

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
