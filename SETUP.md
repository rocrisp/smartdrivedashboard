# Setup Guide

Complete setup instructions for SmartDrive Dashboard.

## Prerequisites

- **Node.js** 18 or later ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Google Cloud** account (free tier works fine)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/rocrisp/smartdrivedashboard.git
cd smartdrivedashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "SmartDrive Dashboard")
4. Click "Create"

### Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required information:
   - **App name**: SmartDrive Dashboard
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `https://www.googleapis.com/auth/drive.metadata.readonly`
   - `https://www.googleapis.com/auth/drive.readonly`
8. Click "Update" and "Save and Continue"
9. On the "Test users" page, add your email address
10. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Enter a name (e.g., "SmartDrive Local Dev")
5. Under "Authorized JavaScript origins", click "Add URI":
   ```
   http://localhost:3000
   ```
6. Under "Authorized redirect URIs", click "Add URI":
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click "Create"
8. **Copy your Client ID and Client Secret**

### Step 5: Configure .env File

Edit your `.env` file with the credentials:

```env
# Database (SQLite)
DATABASE_URL="file:./data/smartdrive.db"

# NextAuth.js
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="paste-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (from Step 4)
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

### Step 6: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the `NEXTAUTH_SECRET` value in your `.env` file.

### Step 7: Initialize Database

```bash
npx prisma generate
npx prisma migrate dev
```

### Step 8: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and sign in with your Google account!

## Production Deployment

### Using Docker (Recommended)

See [README.Docker.md](README.Docker.md) for complete Docker deployment instructions.

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Update `.env` with production URLs:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

3. Update Google Cloud Console OAuth redirect URIs to include your production domain:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

4. Start the production server:
   ```bash
   npm start
   ```

## Troubleshooting

### Common OAuth Errors

#### "Access Blocked: This app's request is invalid"

**Solution:**
- Verify `http://localhost:3000` is in authorized JavaScript origins
- Verify `http://localhost:3000/api/auth/callback/google` is in redirect URIs
- Ensure there are no trailing slashes
- Make sure the URIs are **exactly** as shown above

#### "Sign-in loop" or "OAuthAccountNotLinked"

**Solution:**
1. Clear all cookies for `localhost:3000`
2. Check that `NEXTAUTH_URL` matches your dev URL exactly
3. Verify `NEXTAUTH_SECRET` is set and is a valid base64 string
4. Try signing in with an incognito/private window

#### "Behind corporate firewall"

**Solution:**
- Connect to VPN if required
- Ensure firewall allows connections to `accounts.google.com` and `www.googleapis.com`
- Check with IT department if OAuth is blocked
- Try from a personal network to verify it's a network issue

### Database Issues

#### "Database file is locked"

**Solution:**
```bash
# Stop all running instances
pkill -f "next"

# Remove lock file
rm -f data/*.db-journal

# Restart
npm run dev
```

#### "Database does not exist"

**Solution:**
```bash
# Create data directory
mkdir -p data

# Run migrations
npx prisma migrate dev
```

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Re-authentication After Scope Changes

After updating OAuth scopes in Google Cloud Console:

1. Sign out of SmartDrive Dashboard
2. Clear browser cookies for your domain
3. Clear browser cache (optional but recommended)
4. Sign in again to grant new permissions

### Environment Variable Not Loading

**Solution:**
- Verify `.env` file is in the project root directory
- Check there are no syntax errors in `.env` (no quotes around values unless they contain spaces)
- Restart the development server after changing `.env`
- For Next.js, environment variables starting with `NEXT_PUBLIC_` are exposed to the browser

### Google API Quota Exceeded

**Solution:**
- Free tier: 1,000 queries per 100 seconds per user
- If exceeded, wait or upgrade to paid tier
- Implement caching to reduce API calls
- Dashboard automatically caches Drive responses

## Project Structure

```
smartdrivedashboard/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── auth/              # NextAuth routes
│   │   └── drive/             # Drive API endpoints
│   ├── dashboard/             # Main dashboard page
│   └── page.tsx               # Landing page
├── components/
│   ├── Drive/                 # Drive-specific components
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── google-drive.ts        # Drive API client
│   ├── bookmarks.ts           # Bookmark manager
│   ├── hidden-files.ts        # Hidden files manager
│   └── view-history.ts        # View history tracker
├── prisma/
│   └── schema.prisma          # Database schema
├── data/                      # SQLite database (gitignored)
├── .env                       # Environment variables (gitignored)
└── .env.example               # Environment template
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build optimized production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |
| `npx prisma studio` | Open Prisma Studio to view database |
| `npx prisma migrate dev` | Create and apply database migration |
| `npx prisma generate` | Generate Prisma Client |

## Development Tips

### Hot Reload Not Working

**Solution:**
- Check if `next.config.mjs` has any syntax errors
- Verify file permissions on the project directory
- Try deleting `.next` folder and restarting: `rm -rf .next && npm run dev`

### TypeScript Errors

**Solution:**
```bash
# Regenerate types
npm run build

# Check specific file
npx tsc --noEmit <file-path>
```

### Clear All Data and Start Fresh

```bash
# Stop server
pkill -f "next"

# Remove database
rm -rf data/

# Remove node modules and lock
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Recreate database
npx prisma migrate dev

# Start fresh
npm run dev
```

## Security Considerations

### Production Checklist

- [ ] Use HTTPS (required for OAuth in production)
- [ ] Set strong `NEXTAUTH_SECRET` (different from dev)
- [ ] Update OAuth redirect URIs to production domain
- [ ] Enable Google OAuth consent screen verification
- [ ] Set up proper CORS headers
- [ ] Implement rate limiting
- [ ] Regular database backups
- [ ] Monitor API quota usage
- [ ] Use environment-specific credentials

### Google OAuth App Verification

For production use with external users:

1. Submit your app for Google verification
2. Provide privacy policy and terms of service
3. Complete security assessment
4. May take 4-6 weeks for approval

For personal/internal use, test mode is sufficient.

## Getting Help

1. Check this setup guide
2. Review [Troubleshooting](#troubleshooting) section
3. Check [GitHub Issues](https://github.com/rocrisp/smartdrivedashboard/issues)
4. Verify Google Cloud Console configuration
5. Check server logs for detailed error messages

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Drive API Reference](https://developers.google.com/drive/api/v3/reference)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
