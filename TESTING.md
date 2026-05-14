# Testing Guide

This guide provides instructions for testing My Google Dashboard application features and API endpoints.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Manual Testing](#manual-testing)
- [API Endpoint Testing](#api-endpoint-testing)
- [Feature Testing](#feature-testing)
- [Database Testing](#database-testing)
- [Security Testing](#security-testing)

---

## Prerequisites

Before testing, ensure:

1. Application is running: `npm run dev`
2. Database is connected and schema is pushed
3. Google OAuth is configured
4. You have a test Google account

---

## Manual Testing

### Authentication Flow

**Test 1: Sign In**

1. Navigate to `http://localhost:3000`
2. Click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. **Expected**: Redirect to `/dashboard`
6. **Verify**: Session is created in database

**Test 2: Protected Routes**

1. Sign out
2. Try accessing `/dashboard` directly
3. **Expected**: Redirect to home page
4. Sign in
5. **Expected**: Access granted to dashboard

**Test 3: Sign Out**

1. From dashboard, click "Sign Out"
2. **Expected**: Redirect to home page
3. Try accessing `/dashboard`
4. **Expected**: Redirect to home page

---

## API Endpoint Testing

### Using cURL

#### 1. Health Check Endpoint

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "database": "connected"
}
```

**Verify:**
- Status is "healthy"
- Timestamp is recent
- Database is "connected"

#### 2. Stats Endpoint (Requires Authentication)

```bash
# First, sign in through the browser to get a session cookie
# Then copy the cookie from browser DevTools

curl http://localhost:3000/api/stats \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "totalSignIns": 5,
  "activeSessions": 1,
  "accountAge": 3,
  "totalActivities": 12
}
```

**Verify:**
- Numbers match your actual data
- Response time < 500ms

#### 3. Activities Endpoint (Requires Authentication)

```bash
curl http://localhost:3000/api/activities \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "activities": [
    {
      "id": "...",
      "type": "login",
      "message": "Successfully signed in with Google",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "metadata": null
    }
  ]
}
```

**Verify:**
- Activities are sorted by date (newest first)
- Activity types are correct
- CreatedAt timestamps are valid

#### 4. Create Activity (POST)

```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "custom",
    "message": "Test activity",
    "metadata": "{\"test\": true}"
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "userId": "...",
  "type": "custom",
  "message": "Test activity",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### 5. Preferences Endpoint (GET)

```bash
curl http://localhost:3000/api/preferences \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "id": "...",
  "userId": "...",
  "emailNotifications": true,
  "activityEmailDigest": false,
  "showRecentActivity": true,
  "theme": "system",
  "language": "en",
  "timezone": "UTC",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 6. Update Preferences (PATCH)

```bash
curl -X PATCH http://localhost:3000/api/preferences \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": false,
    "theme": "dark"
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "emailNotifications": false,
  "theme": "dark",
  ...
}
```

---

## Feature Testing

### Dashboard Components

#### Stats Overview

**Test Procedure:**
1. Sign in and navigate to dashboard
2. Observe the 4 stat cards

**Verify:**
- Total Sign-ins count is accurate
- Active Sessions shows 1 (or current count)
- Account Age shows days since first sign-in
- Total Activities count matches database

**Test Dynamic Updates:**
1. Sign out and sign in again
2. Refresh dashboard
3. **Expected**: Total Sign-ins increments by 1

#### Activity Feed

**Test Procedure:**
1. View activity feed on dashboard
2. Check recent activities

**Verify:**
- Activities are listed newest first
- Correct icons for each activity type
- Timestamps are human-readable
- "See All" button is present

**Test Real-time Updates:**
1. Use Quick Actions to trigger an export
2. **Expected**: New "data_export" activity appears
3. Refresh page
4. **Expected**: Activity persists

#### Quick Actions

**Test Each Button:**

1. **Refresh Stats**
   - Click button
   - **Expected**: Toast notification "Stats refreshed"
   - Stats reload from API

2. **Export Data**
   - Click button
   - **Expected**: JSON file downloads
   - File contains user and stats data

3. **Settings**
   - Click button
   - **Expected**: Navigate to `/settings`

4. **Google Account**
   - Click button
   - **Expected**: New tab opens to Google Account page

#### User Profile Card

**Test Procedure:**
1. View dashboard
2. Check profile card

**Verify:**
- Profile image displays (or initials fallback)
- Name is correct
- Email is correct
- Account status shows "Active & Verified"
- Member Since shows current month/year
- User ID displays (truncated)
- Verification badge is visible

### Settings Page

#### Profile Information

**Verify:**
- Profile image matches session
- Name and email are correct
- Account ID is displayed
- Info note about Google sync is visible

#### Appearance Settings

**Test Theme:**
1. Change theme to "Dark"
2. Click "Save Preferences"
3. **Expected**: Toast "Preferences saved successfully"
4. Use theme toggle in header
5. **Expected**: Theme changes immediately
6. Refresh page
7. **Expected**: Dark theme persists

**Test Language:**
1. Select different language
2. Save preferences
3. **Expected**: Preference saved to database

**Test Timezone:**
1. Select different timezone
2. Save preferences
3. **Expected**: Preference saved to database

#### Notification Settings

**Test Each Toggle:**
1. Toggle "Email Notifications"
2. Toggle "Activity Email Digest"
3. Toggle "Show Recent Activity"
4. Click "Save Preferences"
5. **Expected**: Toast confirmation
6. Refresh page
7. **Expected**: Toggles maintain state

### Theme Toggle

**Test in Header:**
1. Click Sun icon (Light mode)
   - **Expected**: Light theme activates
2. Click Monitor icon (System mode)
   - **Expected**: Theme matches system preference
3. Click Moon icon (Dark mode)
   - **Expected**: Dark theme activates
4. Refresh page
   - **Expected**: Theme persists from localStorage

**Test Initial Load:**
1. Clear browser storage
2. Refresh page
3. **Expected**: Theme matches system preference (no flash)

### Toast Notifications

**Test Different Types:**
1. Trigger success toast (export data)
   - **Expected**: Green background, checkmark icon
2. Trigger error toast (disconnect internet, try API call)
   - **Expected**: Red background, X icon
3. **Auto-dismiss**: Wait 5 seconds
   - **Expected**: Toast fades out

---

## Database Testing

### Using Prisma Studio

```bash
npm run db:studio
```

**Test Procedures:**

#### 1. Verify User Creation

1. Sign in with new Google account
2. Open Prisma Studio
3. Navigate to `User` table
4. **Verify:**
   - User record exists
   - Email matches
   - createdAt is set
   - Account relation exists

#### 2. Verify Activity Logging

1. Perform actions in app (sign in, export data)
2. Check `Activity` table
3. **Verify:**
   - Activities are created
   - userId matches
   - Timestamps are correct
   - Types are accurate (login, signup, data_export)

#### 3. Verify Session Management

1. Sign in
2. Check `Session` table
3. **Verify:**
   - Session record exists
   - sessionToken is unique
   - expires is in future
   - userId matches

#### 4. Verify Preferences

1. Update preferences in settings
2. Check `UserPreferences` table
3. **Verify:**
   - Preferences record exists
   - Values match what was saved
   - updatedAt timestamp updates

### Database Queries

```sql
-- Count total users
SELECT COUNT(*) FROM "User";

-- Count activities per user
SELECT "userId", COUNT(*) as activity_count 
FROM "Activity" 
GROUP BY "userId";

-- Check active sessions
SELECT * FROM "Session" 
WHERE expires > NOW();

-- View recent activities
SELECT * FROM "Activity" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

---

## Security Testing

### Authentication

**Test 1: Unauthorized Access**

```bash
# Try accessing API without authentication
curl http://localhost:3000/api/stats
```

**Expected Response:**
```json
{
  "error": "Unauthorized"
}
```

**Status Code**: 401

**Test 2: Invalid Session**

```bash
curl http://localhost:3000/api/stats \
  -H "Cookie: next-auth.session-token=invalid-token"
```

**Expected**: Redirect to sign in or 401 error

**Test 3: CSRF Protection**

NextAuth.js includes CSRF protection by default.

1. Try to make POST request from different origin
2. **Expected**: Request blocked

### Headers

**Test Security Headers:**

```bash
curl -I http://localhost:3000
```

**Verify Headers:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- No `X-Powered-By` header

### Environment Variables

**Test Missing Variables:**

1. Comment out `GOOGLE_CLIENT_ID` in `.env`
2. Run `npm run check:env`
3. **Expected**: Script reports missing variable
4. Try to build: `npm run build`
5. **Expected**: Build succeeds but OAuth won't work

---

## Performance Testing

### Page Load Times

**Test Procedure:**

1. Open Chrome DevTools → Network tab
2. Navigate to each page
3. Check "Load" time

**Acceptable Times:**
- Home page: < 1s
- Dashboard (after auth): < 2s
- Settings: < 1s

### API Response Times

**Test Procedure:**

```bash
# Test response time
time curl http://localhost:3000/api/health
```

**Acceptable Times:**
- `/api/health`: < 100ms
- `/api/stats`: < 500ms
- `/api/activities`: < 500ms
- `/api/preferences`: < 300ms

### Database Query Performance

**Test Procedure:**

1. Enable Prisma query logging in `.env`:
   ```
   DEBUG=prisma:query
   ```
2. Perform operations
3. Check console for query times

**Acceptable Times:**
- Simple queries: < 50ms
- Joined queries: < 100ms

---

## Automated Testing (Optional)

For a more comprehensive testing setup, consider:

### Install Testing Dependencies

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

### Example Test File

Create `__tests__/api/health.test.ts`:

```typescript
import { GET } from '@/app/api/health/route';

describe('Health API', () => {
  it('should return healthy status', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.database).toBe('connected');
  });
});
```

---

## Test Coverage Checklist

### Core Features
- [ ] Google OAuth sign-in works
- [ ] Protected routes require authentication
- [ ] Sign out works correctly
- [ ] Session persists across page reloads

### Dashboard
- [ ] Stats display correct data
- [ ] Activity feed loads
- [ ] Quick actions all work
- [ ] Profile card displays user info

### Settings
- [ ] Preferences load from database
- [ ] Theme selection works
- [ ] Notification toggles work
- [ ] Save button updates database

### API Endpoints
- [ ] `/api/health` returns healthy status
- [ ] `/api/stats` requires auth
- [ ] `/api/activities` GET works
- [ ] `/api/activities` POST works
- [ ] `/api/preferences` GET/PATCH work

### Database
- [ ] User creation on first sign-in
- [ ] Activity logging works
- [ ] Session management works
- [ ] Preferences persist

### Security
- [ ] Unauthorized requests are blocked
- [ ] Security headers are present
- [ ] OAuth flow is secure
- [ ] Environment variables are validated

---

## Troubleshooting Test Failures

### Authentication Tests Fail

**Check:**
- Google OAuth credentials are valid
- Redirect URIs match exactly
- `NEXTAUTH_URL` is correct
- `NEXTAUTH_SECRET` is set

### Database Tests Fail

**Check:**
- PostgreSQL is running
- `DATABASE_URL` is correct
- Prisma schema is pushed: `npm run db:push`
- Prisma client is generated: `npm run db:generate`

### API Tests Fail

**Check:**
- Server is running: `npm run dev`
- Session cookie is valid
- Database connection is active
- No CORS issues (same origin)

---

## Continuous Testing

### Before Every Commit

1. Run linting: `npm run lint`
2. Type check: `npx tsc --noEmit`
3. Build: `npm run build`
4. Test authentication flow
5. Test one API endpoint

### Before Every Deploy

1. Full authentication testing
2. All API endpoints
3. Database schema validation
4. Security header check
5. Performance check

---

## Test Results Log

Keep a log of test results:

```
Date: 2024-01-01
Tester: Your Name
Environment: Development

✅ Authentication Flow: PASS
✅ Dashboard Load: PASS  
✅ API Health Check: PASS
✅ Stats Endpoint: PASS
✅ Activities CRUD: PASS
✅ Preferences: PASS
✅ Security Headers: PASS
⚠️ Page Load Time: 2.3s (acceptable: <2s) - NEEDS IMPROVEMENT

Notes:
- Dashboard load time slightly high, investigate database query
- All core features working as expected
```

---

**Testing Complete!** Use this guide to ensure all features work correctly before deployment. 🧪
