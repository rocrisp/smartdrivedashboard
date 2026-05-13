# Deployment Guide

This guide covers deploying My Google Dashboard to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:
- ✅ A PostgreSQL database (production)
- ✅ Google OAuth credentials configured for your production domain
- ✅ All environment variables ready

## 🚀 Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications and is created by the Next.js team.

### Step 1: Prepare Your Database

Use a cloud PostgreSQL provider:
- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Simple deployment

### Step 2: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth credentials
3. Add your Vercel domain to authorized origins:
   ```
   https://your-app.vercel.app
   ```
4. Add callback URL:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure your project
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   ```
   DATABASE_URL=<your-production-database-url>
   NEXTAUTH_SECRET=<generate-new-secret>
   NEXTAUTH_URL=https://your-app.vercel.app
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   ```
6. Click "Deploy"

### Step 4: Push Database Schema

```bash
# After deployment, push your schema to production database
DATABASE_URL="<production-url>" npx prisma db push
```

## 🐳 Docker

### Build Docker Image

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

Update `next.config.mjs`:

```javascript
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

export default nextConfig;
```

Build and run:

```bash
# Build
docker build -t mygoogledashboard .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e GOOGLE_CLIENT_ID="your-client-id" \
  -e GOOGLE_CLIENT_SECRET="your-client-secret" \
  mygoogledashboard
```

## 🌐 Netlify

Netlify requires some additional configuration for Next.js.

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. Set environment variables in Netlify dashboard

Note: Netlify may have limitations with Next.js App Router features.

## ☁️ AWS / DigitalOcean / Other VPS

### Using PM2

1. Set up your server with Node.js 18+

2. Install PM2:
   ```bash
   npm install -g pm2
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'mygoogledashboard',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

5. Start with PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Using Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/mygoogledashboard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/mygoogledashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Production Checklist

Before going live, ensure:

- [ ] Environment variables are set correctly
- [ ] Database schema is pushed to production
- [ ] Google OAuth redirect URIs include production domain
- [ ] NEXTAUTH_URL matches production domain
- [ ] NEXTAUTH_SECRET is a strong, unique value
- [ ] Database backups are configured
- [ ] SSL/HTTPS is enabled
- [ ] Error logging is set up
- [ ] Performance monitoring is in place

## 🔐 Environment Variables for Production

```env
# Database - Use production PostgreSQL URL
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth - Generate new secret for production
NEXTAUTH_SECRET="<generate-new-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://your-production-domain.com"

# Google OAuth - Same as development or create new credentials
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"

# Optional: Logging and monitoring
NODE_ENV="production"
```

## 📊 Monitoring

Consider adding:
- **Error Tracking**: [Sentry](https://sentry.io)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) or [Google Analytics](https://analytics.google.com)
- **Uptime Monitoring**: [UptimeRobot](https://uptimerobot.com)
- **Performance**: [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

## 🆘 Troubleshooting Production Issues

### Authentication Not Working

- Verify NEXTAUTH_URL matches exactly (including https://)
- Check Google OAuth redirect URIs
- Ensure NEXTAUTH_SECRET is set and different from development

### Database Connection Failed

- Verify DATABASE_URL is correct
- Check if database allows connections from your hosting provider's IPs
- Ensure SSL mode is configured if required
- Confirm Prisma schema is pushed to production database

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Runtime Errors

Check logs:
```bash
# Vercel
vercel logs

# PM2
pm2 logs mygoogledashboard

# Docker
docker logs <container-id>
```

## 🎯 Performance Optimization

1. **Enable Image Optimization**: Already configured in Next.js
2. **Add Caching Headers**: Configure in your hosting platform
3. **Enable Compression**: Gzip/Brotli (usually automatic)
4. **Use CDN**: Vercel provides this automatically
5. **Database Indexing**: Add indexes to frequently queried fields in Prisma

## 🔄 Updating Production

### Vercel (Automatic)
- Push to your main branch
- Vercel automatically deploys

### Manual Deployment
```bash
git pull origin main
npm install
npm run build
npx prisma db push  # If schema changed
pm2 restart mygoogledashboard
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

**Need help?** Check the main README.md troubleshooting section or open an issue.
