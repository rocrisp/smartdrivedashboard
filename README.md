# My Google Dashboard 🚀

A modern, secure proof-of-concept personal dashboard application for managing Google services, built with the latest web technologies.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

## ✨ Features

### Core Functionality
- **🔐 Google OAuth Authentication**: Secure sign-in with your Google account
- **💾 Database Storage**: PostgreSQL database with Prisma ORM
- **📊 Real-time Statistics**: Track sign-ins, sessions, and account activity
- **📝 Activity Logging**: Automatic tracking of user actions and events
- **⚙️ Settings Management**: User preferences and account management

### User Interface
- **🎨 Modern UI**: Clean, intuitive, and responsive design using Tailwind CSS
- **🌙 Dark Mode**: Automatic dark mode support based on system preferences
- **📱 Mobile Responsive**: Optimized for all screen sizes and devices
- **🔔 Toast Notifications**: Real-time feedback for user actions
- **💀 Skeleton Loaders**: Smooth loading states for better UX
- **♿ Accessibility**: WCAG compliant with ARIA labels and keyboard navigation

### Developer Experience
- **🔒 Type-Safe**: Built with TypeScript for reliability
- **⚡ Fast**: Built on Next.js 15 with React 19
- **🛡️ Secure**: Industry-standard OAuth 2.0 authentication
- **🎯 API Endpoints**: Health checks, statistics, and activity tracking
- **📚 Comprehensive Docs**: Setup guides, deployment docs, and contributing guidelines
- **🔧 Development Tools**: Automated setup, environment validation, and database seeding

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or later ([Download](https://nodejs.org/))
- **PostgreSQL** database (local or cloud)
- **Google Cloud** account for OAuth credentials

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
npm run setup

# Configure your .env file (see instructions below)
# Then push database schema
npm run db:push

# Start the development server
npm run dev
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your credentials (see Configuration section)

# 4. Generate Prisma client
npm run db:generate

# 5. Push database schema
npm run db:push

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Configuration

### 1. PostgreSQL Database

Choose one of these options:

#### Option A: Cloud Database (Easiest)
- **[Supabase](https://supabase.com)** - Free tier, instant setup
- **[Railway](https://railway.app)** - Free tier, great for dev
- **[Neon](https://neon.tech)** - Serverless PostgreSQL

#### Option B: Local PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql
createdb mygoogledashboard

# Ubuntu/Debian
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb mygoogledashboard

# Your DATABASE_URL will be:
postgresql://username:password@localhost:5432/mygoogledashboard
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Configure consent screen if prompted
6. Choose "Web application"
7. Add authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
8. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
9. Copy your **Client ID** and **Client Secret**

### 3. Environment Variables

Edit your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mygoogledashboard"

# NextAuth.js
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Validate Configuration

```bash
npm run check:env
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:safe` | Start with environment validation |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run setup` | Automated setup script |
| `npm run check:env` | Validate environment variables |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database |

## 📁 Project Structure

```
mygoogledashboard/
├── app/                         # Next.js app directory
│   ├── api/                     # API routes
│   │   ├── activities/         # Activity tracking endpoints
│   │   ├── auth/               # NextAuth.js routes
│   │   ├── health/             # Health check endpoint
│   │   ├── stats/              # Statistics endpoint
│   │   └── status/             # Status endpoint
│   ├── dashboard/              # Dashboard page
│   │   ├── page.tsx            # Dashboard UI
│   │   └── loading.tsx         # Loading state
│   ├── settings/               # Settings page
│   ├── error.tsx               # Error boundary
│   ├── loading.tsx             # Global loading
│   ├── not-found.tsx           # 404 page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home/login page
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── Dashboard/              # Dashboard-specific
│   │   ├── ActivityFeed.tsx    # Activity widget
│   │   ├── QuickActions.tsx    # Quick actions widget
│   │   └── StatsOverview.tsx   # Statistics widget
│   ├── ui/                     # Reusable UI components
│   │   ├── Card.tsx            # Card component
│   │   ├── Button.tsx          # Button component
│   │   ├── Toast.tsx           # Toast notifications
│   │   └── Skeleton.tsx        # Skeleton loaders
│   ├── AuthProvider.tsx        # Session provider
│   ├── Header.tsx              # Navigation header
│   ├── Footer.tsx              # Footer component
│   └── SkipToContent.tsx       # Accessibility skip link
├── lib/                        # Utility libraries
│   ├── auth.ts                 # NextAuth config
│   └── prisma.ts               # Prisma client
├── prisma/                     # Database
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── scripts/                    # Helper scripts
│   ├── setup.sh                # Setup automation
│   ├── check-env.js            # Environment validator
│   └── dev.sh                  # Safe dev start
├── types/                      # TypeScript types
│   └── next-auth.d.ts          # NextAuth types
└── public/                     # Static files
    ├── logo.svg                # Application logo
    └── manifest.json           # PWA manifest
```

## 🔒 Security

- **OAuth 2.0**: Industry-standard authentication
- **Session Management**: Secure database-backed sessions
- **Environment Variables**: Sensitive data isolated
- **HTTPS Ready**: Production-ready security headers
- **Type Safety**: TypeScript prevents common bugs

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.7 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 3.4 |
| **Authentication** | NextAuth.js 4 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6 |
| **Icons** | Lucide React |
| **Linting** | ESLint 9 |

## 🚧 Roadmap

Future enhancements for this POC:

- [ ] Google Calendar integration
- [ ] Gmail stats and insights
- [ ] Google Drive usage dashboard
- [ ] Google Analytics data visualization
- [ ] Customizable dashboard widgets
- [ ] Data export functionality
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Mobile app

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
brew services list  # macOS
systemctl status postgresql  # Linux

# Test database connection
npm run db:studio

# If connection fails, verify DATABASE_URL in .env
```

### Google OAuth Issues

- ✅ Verify redirect URI matches exactly in Google Console
- ✅ Check that both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- ✅ Ensure `NEXTAUTH_URL` matches your development URL
- ✅ Clear browser cookies and try again
- ✅ Check Google Cloud Console for any disabled APIs

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npm run db:generate
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## 🤝 Contributing

This is a proof of concept project. Feel free to fork and enhance!

## 📄 License

MIT License - feel free to use this project for learning and development.

## 💬 Support

For issues and questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the configuration steps
3. Verify all environment variables are set correctly
4. Check that your database is accessible

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
