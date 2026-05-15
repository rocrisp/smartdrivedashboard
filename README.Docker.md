# Docker Deployment Guide

This guide explains how to run SmartDrive Dashboard using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)
- Google OAuth credentials ([Get them here](https://console.cloud.google.com/apis/credentials))

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/rocrisp/smartdrivedashboard.git
cd smartdrivedashboard
```

### 2. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```bash
# Database (for Docker)
DATABASE_URL="file:/app/data/smartdrive.db"

# NextAuth.js
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Start the application

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Create a SQLite database in `./data/smartdrive.db`
- Start the application on http://localhost:3000

### 4. View logs

```bash
docker-compose logs -f app
```

### 5. Stop the application

```bash
docker-compose down
```

## Data Persistence

The SQLite database is stored in the `./data` directory on your host machine. This directory is mounted as a volume in the Docker container, ensuring your data persists across container restarts.

**Important:** The `./data` directory is automatically created when you run `docker-compose up`. Do not delete this directory if you want to keep your data.

## Updating the Application

To update to the latest version:

```bash
# Pull the latest code
git pull origin main

# Rebuild and restart the container
docker-compose up -d --build
```

## Backup and Restore

### Backup

Simply copy the `data` directory:

```bash
cp -r data data-backup-$(date +%Y%m%d)
```

### Restore

Stop the container and replace the data directory:

```bash
docker-compose down
rm -rf data
cp -r data-backup-YYYYMMDD data
docker-compose up -d
```

## Troubleshooting

### Database is locked

If you see "database is locked" errors, make sure only one instance of the application is running:

```bash
docker-compose down
docker-compose up -d
```

### Permission errors

If you get permission errors with the data directory:

```bash
chmod -R 755 data
```

### Reset database

To start fresh with a new database:

```bash
docker-compose down
rm -rf data
docker-compose up -d
```

## Production Deployment

For production deployment:

1. Use a proper domain name and HTTPS
2. Update `NEXTAUTH_URL` in `.env` to your domain
3. Generate a strong `NEXTAUTH_SECRET`
4. Configure your Google OAuth redirect URLs
5. Consider using Docker secrets for sensitive environment variables
6. Set up regular database backups

## Local Development vs Docker

- **Local Development**: Uses `file:./data/smartdrive.db` in `.env`
- **Docker**: Uses `file:/app/data/smartdrive.db` (set in docker-compose.yml)

The application automatically detects which environment it's running in.
