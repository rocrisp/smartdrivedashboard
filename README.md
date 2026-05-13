# My Google Dashboard

A proof-of-concept personal dashboard application for managing Google services, built with Next.js, TypeScript, and PostgreSQL.

## Features

- **Google OAuth Authentication**: Secure sign-in with your Google account
- **Modern UI**: Clean, intuitive, and responsive design using Tailwind CSS
- **Database Storage**: PostgreSQL database for user data with Prisma ORM
- **Type-Safe**: Built with TypeScript for reliability
- **Dark Mode**: Automatic dark mode support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google Provider
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- Google Cloud Console account

## Setup Instructions

### 1. Clone and Install

```bash
# Navigate to the project directory
cd mygoogledashboard

# Install dependencies
npm install
```

### 2. Set Up PostgreSQL Database

You can use a local PostgreSQL installation or a cloud provider like:
- [Supabase](https://supabase.com) (free tier available)
- [Railway](https://railway.app) (free tier available)
- [Neon](https://neon.tech) (free tier available)

For local PostgreSQL:
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb mygoogledashboard
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000`
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
8. Copy the Client ID and Client Secret

### 4. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mygoogledashboard"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 6. Run the Application

```bash
# Development mode
npm run dev

# Open http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
mygoogledashboard/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   └── auth/            # NextAuth.js routes
│   ├── dashboard/           # Dashboard page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   └── AuthProvider.tsx     # Session provider
├── lib/                     # Utility functions
│   ├── auth.ts              # NextAuth configuration
│   └── prisma.ts            # Prisma client
├── prisma/                  # Prisma schema
│   └── schema.prisma        # Database schema
├── types/                   # TypeScript types
│   └── next-auth.d.ts       # NextAuth types
└── public/                  # Static files
```

## Security Features

- **OAuth 2.0**: Secure authentication via Google
- **Session Management**: Database-backed sessions
- **HTTPS Ready**: Production-ready security headers
- **Environment Variables**: Sensitive data kept in .env files

## Future Enhancements

This is a POC with potential for additional features:
- Google Calendar integration
- Gmail stats and insights
- Google Drive usage dashboard
- Google Analytics data
- Customizable widgets
- Data export functionality

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `brew services list`
- Check DATABASE_URL in .env file
- Test connection: `npm run db:studio`

### Google OAuth Issues
- Verify redirect URIs in Google Cloud Console
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure NEXTAUTH_URL matches your development URL

### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Regenerate Prisma client: `npm run db:generate`

## License

MIT

## Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.
