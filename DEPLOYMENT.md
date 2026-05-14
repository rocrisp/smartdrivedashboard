# Deployment Guide

This guide walks you through deploying My Google Dashboard to production environments.

## Table of Contents

- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Railway Deployment](#railway-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment Steps](#post-deployment-steps)
- [Troubleshooting](#troubleshooting)

---

## Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying Next.js applications. It offers seamless integration, automatic deployments, and excellent performance.

### Prerequisites

- GitHub account
- Vercel account ([Sign up](https://vercel.com/signup))
- PostgreSQL database (see [Database Setup](#database-setup))
- Google OAuth credentials configured

### Step 1: Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In the Vercel dashboard, add these environment variables:

#### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# NextAuth.js
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important:**
- Generate a new `NEXTAUTH_SECRET` for production: `openssl rand -base64 32`
- Use the Vercel-provided URL for `NEXTAUTH_URL`
- Enable SSL mode for PostgreSQL connection string

### Step 4: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

### Step 5: Deploy

Click **"Deploy"** in Vercel. The deployment will:
1. Install dependencies
2. Run Prisma generate
3. Build the Next.js application
4. Deploy to production

### Step 6: Database Migration

After deployment, push the database schema:

```bash
# Set the production DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Push schema to production database
npx prisma db push
```

### Step 7: Verify Deployment

1. Visit your deployed URL
2. Test Google OAuth login
3. Check dashboard functionality
4. Verify database connectivity at `/api/health`

---

## Database Setup

### Option 1: Supabase (Recommended for Vercel)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (Session mode)
5. Enable **SSL mode** by appending `?sslmode=require`

Example:
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require
```

### Option 2: Railway

1. Sign up at [railway.app](https://railway.app)
2. Create new project
3. Add **PostgreSQL** service
4. Copy connection string from **Connect** tab
5. Use in `DATABASE_URL` environment variable

### Option 3: Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Neon automatically includes SSL mode

---

## Railway Deployment

Railway offers a simple deployment process with built-in PostgreSQL.

### Quick Deploy

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Add **PostgreSQL** service to your project
5. Configure environment variables in Railway dashboard
6. Railway will auto-deploy on git push

### Environment Variables

Add the same variables as Vercel deployment:
- `DATABASE_URL` (automatically provided by Railway PostgreSQL)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and Google OAuth settings

---

## Docker Deployment

For self-hosted or cloud VM deployment.

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/mygoogledashboard
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mygoogledashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma db push

# View logs
docker-compose logs -f app
```

---

## Environment Variables

### Production Best Practices

1. **Never commit secrets** to version control
2. **Use different secrets** for each environment
3. **Rotate secrets regularly** (especially `NEXTAUTH_SECRET`)
4. **Enable SSL** for database connections
5. **Use environment-specific** Google OAuth credentials

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string with SSL | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Random secret for session encryption | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL of your deployed app | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxx` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |

---

## Post-Deployment Steps

### 1. Verify Application Health

```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "database": "connected"
}
```

### 2. Test Authentication Flow

1. Navigate to your deployed URL
2. Click **"Sign in with Google"**
3. Complete OAuth flow
4. Verify redirect to dashboard
5. Check activity logging in database

### 3. Monitor Logs

**Vercel:**
- Go to project dashboard
- Click **"Deployments"** → Select deployment
- View **"Functions"** logs

**Railway:**
- Click on your service
- View **"Logs"** tab in real-time

### 4. Set Up Custom Domain (Optional)

**Vercel:**
1. Go to **Settings** → **Domains**
2. Add your domain
3. Configure DNS records
4. Update `NEXTAUTH_URL` environment variable
5. Update Google OAuth redirect URIs

**Railway:**
1. Similar process in Railway dashboard
2. Update environment variables
3. Update OAuth settings

### 5. Configure Analytics (Optional)

Enable Vercel Analytics:
```bash
npm install @vercel/analytics
```

Update `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Troubleshooting

### Build Failures

**Error: Cannot find module 'prisma'**
```bash
# Ensure postinstall script runs
# Add to package.json if missing:
"postinstall": "prisma generate"
```

**Error: Environment variable not found**
- Verify all required environment variables are set in deployment platform
- Check for typos in variable names
- Ensure no trailing spaces in values

### Database Connection Issues

**SSL Required Error**
```
Add ?sslmode=require to DATABASE_URL
postgresql://user:pass@host:5432/db?sslmode=require
```

**Connection Timeout**
- Verify database is accessible from deployment platform
- Check firewall rules
- Ensure connection string is correct

### OAuth Errors

**Redirect URI Mismatch**
1. Check Google Console redirect URIs exactly match
2. Include both HTTP and HTTPS if testing
3. Ensure no trailing slashes

**Invalid Client Error**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check if OAuth consent screen is published
- Ensure credentials are for the correct Google Cloud project

### Runtime Errors

**Check Vercel Function Logs:**
1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"** → Latest deployment
4. View **"Functions"** tab for error logs

**Check Railway Logs:**
```bash
railway logs
```

### Performance Issues

**Slow Database Queries:**
- Enable Prisma query logging
- Add database indexes for frequently queried fields
- Use database connection pooling (PgBouncer)

**High Function Execution Time:**
- Enable Vercel Speed Insights
- Optimize API routes
- Use static generation where possible

---

## Security Checklist

Before going to production:

- [ ] Use production-grade `NEXTAUTH_SECRET`
- [ ] Enable SSL for database connections
- [ ] Set up proper CORS policies
- [ ] Configure security headers (already in `next.config.mjs`)
- [ ] Enable HTTPS only
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting for API routes
- [ ] Review and minimize environment variable exposure
- [ ] Set up backup strategy for database
- [ ] Enable audit logging
- [ ] Configure Content Security Policy
- [ ] Test OAuth flow in production
- [ ] Verify error pages don't leak sensitive info

---

## Monitoring and Maintenance

### Recommended Tools

1. **Vercel Analytics** - Built-in performance monitoring
2. **Sentry** - Error tracking and monitoring
3. **Datadog** - Infrastructure monitoring
4. **PostgreSQL** - Database query monitoring via provider dashboard

### Regular Maintenance

- Monitor database size and performance
- Review application logs weekly
- Update dependencies monthly
- Rotate secrets quarterly
- Review OAuth permissions
- Check for security vulnerabilities: `npm audit`

---

## Cost Estimation

### Vercel (Hobby Plan)

- **Free tier includes:**
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic SSL
  - Built-in CDN

### Database Hosting

- **Supabase**: Free tier (500MB, 2 CPU hours/day)
- **Railway**: $5/month (500MB RAM, 1GB storage)
- **Neon**: Free tier (3GB storage)

### Estimated Monthly Cost

**Development/POC**: $0 (using free tiers)
**Production**: $5-20/month depending on usage

---

## Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

**Ready to deploy!** Follow the steps above and your My Google Dashboard will be live in production. 🚀
