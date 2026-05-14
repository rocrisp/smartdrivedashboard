# SmartDrive Dashboard 🚀

A floating window interface for managing your Google Drive files with intelligent organization. Never lose track of shared documents again!

**The Problem**: Google Drive's default UI makes it hard to find files shared with you, distinguish file types at a glance, or remember where you saw something before.

**The Solution**: SmartDrive Dashboard gives you draggable, resizable windows for every file view, plus virtual buckets for custom organization. Drag files between windows, collapse views you're not using, and arrange your workspace however you like.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-Yes-success?style=for-the-badge)

</div>

## ✨ Features

### Core Features
- 📁 **Find Shared Files Easily** - See all files shared with you, grouped by who shared them
- 🔍 **Smart Search** - Full-text search with file type filtering
- ⭐ **Bookmark System** - Pin important files for quick access (stored locally)
- 👥 **See Who Shared What** - Clear attribution for every shared document
- 🕒 **Recently Viewed** - Track files you've opened, sorted by recency
- 📊 **File Type Filters** - Filter by Docs, Sheets, Slides, Images, Videos with live counts
- 🔢 **Sorting Options** - Sort by name, date, or sharer across all tabs
- 📝 **View History** - Local tracking of every file you click on

### Technical Features
- 🔐 **Google OAuth 2.0** - Secure read-only access to your Drive
- 🌙 **Dark Mode** - Manual Light/Dark/System theme switching
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⌨️ **Keyboard Shortcuts** - Navigate quickly with keyboard
- ♿ **Accessible** - WCAG Level AA compliant
- 💾 **Offline-First** - Bookmarks and history stored locally
- 🚀 **Fast & Lightweight** - No backend database for user data
- 🔒 **Privacy-Focused** - Read-only Drive access, local storage only

## 🎯 Perfect For

- ✅ Finding documents colleagues shared with you
- ✅ Organizing files by collaborator or sharer
- ✅ Quickly accessing frequently-used spreadsheets
- ✅ Searching across all your Drive files
- ✅ Tracking which files you've viewed recently
- ✅ Filtering large file lists by type (Docs, Sheets, etc.)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or later ([Download](https://nodejs.org/))
- **Google Cloud** account for OAuth credentials

### Setup Instructions

```bash
# 1. Clone and install
git clone <your-repo-url>
cd mygoogledashboard
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Google OAuth credentials (see below)

# 3. Generate NEXTAUTH_SECRET
openssl rand -base64 32
# Add the output to .env as NEXTAUTH_SECRET

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to "APIs & Services" → "Library"
4. Enable **Google Drive API**

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in app name, email, and developer contact
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.metadata.readonly`
   - `https://www.googleapis.com/auth/drive.readonly`
5. Add test users (your email) if in development mode
6. Save and continue

### 3. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Click "Create"
7. Copy your **Client ID** and **Client Secret**

### 4. Configure Environment Variables

Edit your `.env` file:

```env
# NextAuth.js
# Generate: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (from step 3)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 📱 Dashboard Tabs

### 1. Recently Viewed
- Shows files you've viewed recently (sorted by `viewedByMeTime`)
- Filter by file type (Docs, Sheets, Slides, Images, Videos)
- Sort by: Recently Viewed, Name (A-Z), Last Modified
- File counts shown for each filter

### 2. Shared with Me
- Files shared with you, grouped by who shared them
- Filter by file type with counts
- Sort by: Most Recent, Name (A-Z), Sharer (A-Z)
- Solves the main problem: "Can't find docs others shared unless I star them"

### 3. Search Files
- Full-text search across all Drive files
- Filter search results by file type
- Shows total results and filtered counts
- Example: "Found 45 files • Showing 12 docs"

### 4. Bookmarks
- Files you've starred within the dashboard
- Stored locally (not synced to Drive stars)
- Sort by: Recently Bookmarked, Name (A-Z)
- Quick delete and open actions

### 5. View History
- Local tracking of every file you click
- Chronological list with timestamps
- Sort by: Recently Viewed, Name (A-Z)
- Shows who shared each file
- Clear individual entries or clear all

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show help modal |
| `d` | Go to Dashboard |
| `s` | Go to Settings |
| `e` | Go to Sessions |
| `r` | Refresh page |
| `/` | Focus search (in Search tab) |
| `Esc` | Close modals |

*Shortcuts disabled when typing in input fields*

## 🎨 File Type Icons

The dashboard color-codes files for quick recognition:

| Type | Icon | Color |
|------|------|-------|
| Google Docs | 📄 | Blue |
| Google Sheets | 📊 | Green |
| Google Slides | 📽️ | Orange |
| Images | 🖼️ | Pink |
| Videos | 🎥 | Red |
| PDFs | 📕 | Gray |
| Folders | 📁 | Yellow |
| Other | 📎 | Gray |

## 🔒 Privacy & Security

- **Read-Only Access**: Dashboard only reads file metadata, never modifies files
- **Local Storage**: Bookmarks and view history stored in your browser only
- **No Backend Database**: No user data sent to any server
- **OAuth Scopes**:
  - `drive.metadata.readonly` - Read file names, types, dates
  - `drive.readonly` - Read file content (for search)
- **Secure Sessions**: NextAuth.js JWT sessions
- **No Tracking**: No analytics or user tracking

## 📁 Project Structure

```
mygoogledashboard/
├── app/
│   ├── api/
│   │   ├── auth/              # NextAuth routes
│   │   └── drive/             # Drive API endpoints
│   │       ├── shared-with-me/
│   │       ├── recently-viewed/
│   │       ├── search/
│   │       └── my-files/
│   ├── dashboard/             # Main dashboard page
│   └── page.tsx               # Landing page
├── components/
│   ├── Drive/                 # Drive-specific components
│   │   ├── SharedWithMe.tsx
│   │   ├── RecentlyViewed.tsx
│   │   ├── FileSearch.tsx
│   │   ├── BookmarkedFiles.tsx
│   │   ├── ViewHistory.tsx
│   │   ├── DriveFileList.tsx  # Reusable file list
│   │   └── FileTypeFilter.tsx # Filter buttons
│   └── ui/                    # UI components
├── lib/
│   ├── auth.ts                # NextAuth config with Drive scopes
│   ├── google-drive.ts        # Drive API client
│   ├── bookmarks.ts           # Bookmark manager (localStorage)
│   └── view-history.ts        # View history tracker
├── hooks/
│   └── useKeyboardShortcuts.ts
└── types/
    └── next-auth.d.ts
```

## 🔌 API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/drive/shared-with-me` | GET | Fetch files shared with user |
| `/api/drive/recently-viewed` | GET | Fetch recently viewed files |
| `/api/drive/search?q={query}` | GET | Search all Drive files |
| `/api/drive/my-files?mimeType={type}` | GET | Fetch user's files by type |
| `/api/auth/[...nextauth]` | * | Authentication routes |

All Drive endpoints require authentication via NextAuth session.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🐛 Troubleshooting

### Google OAuth Issues

**"Access Blocked: This app's request is invalid"**
- ✅ Add `http://localhost:3000` to authorized JavaScript origins
- ✅ Add `http://localhost:3000/api/auth/callback/google` to redirect URIs
- ✅ Ensure both URIs are **exactly** as shown (no trailing slashes)

**"Sign-in loop" or "OAuthAccountNotLinked"**
- ✅ Clear all site cookies
- ✅ Check that `NEXTAUTH_URL` matches your dev URL
- ✅ Verify `NEXTAUTH_SECRET` is set and generated correctly

**"Behind corporate firewall"**
- ✅ Connect to VPN if accessing from corporate network
- ✅ Ensure firewall allows connections to `accounts.google.com`
- ✅ Check with IT if OAuth is blocked

### Re-authentication Required

After updating OAuth scopes, users must:
1. Sign out of the dashboard
2. Clear browser cookies for `localhost:3000`
3. Sign in again to grant new Drive permissions

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## 🎯 Development Iterations

This project was built iteratively with Ralph Loop:

- **Iteration 1**: Google Drive API integration, OAuth setup
- **Iteration 2**: Phase 2 features (search, filters, bookmarks, history)
- **Iteration 3**: Polish (sorting, file counts, search filtering)

See [ITERATION_3_SUMMARY.md](ITERATION_3_SUMMARY.md) for detailed iteration notes.

## 🚧 Roadmap

### Completed ✅
- [x] Google Drive OAuth with read-only scopes
- [x] Recently Viewed files tab
- [x] Shared with Me tab (grouped by sharer)
- [x] Full-text search across all files
- [x] File type filtering with counts
- [x] Bookmark system (localStorage)
- [x] View history tracking
- [x] Sorting options (name, date, sharer)
- [x] Dark mode support
- [x] Keyboard shortcuts
- [x] Responsive design

### Future Enhancements
- [ ] My Files tab (browse user's own files)
- [ ] Folder navigation with breadcrumbs
- [ ] Tags for organizing bookmarks
- [ ] Export bookmark/history lists
- [ ] Pagination for large file lists
- [ ] Skeleton loading states
- [ ] "Shared BY me" view
- [ ] File statistics dashboard
- [ ] Calendar integration for scheduled docs

## 🤝 Contributing

Contributions welcome! This is a production-ready proof of concept demonstrating:
- Google Drive API integration
- Read-only OAuth scopes
- Client-side data persistence (localStorage)
- Modern Next.js 15 App Router patterns
- TypeScript best practices

## 📄 License

MIT License - free to use for learning and development.

## 💬 Support

For issues:
1. Check [Troubleshooting](#-troubleshooting) section
2. Verify all environment variables are set correctly
3. Ensure Google Cloud Console OAuth is configured properly
4. Check that Drive API is enabled in your project

## 📚 Related Documentation

- [DRIVE_FEATURES.md](DRIVE_FEATURES.md) - Comprehensive user guide
- [ITERATION_3_SUMMARY.md](ITERATION_3_SUMMARY.md) - Development iteration notes
- [CLAUDE.md](CLAUDE.md) - Project requirements and technical design

---

<div align="center">

**✅ Built with Ralph Loop | 3 Iterations | Google Drive Dashboard**

Built with ❤️ using Next.js, TypeScript, and Google Drive API

*Solving the problem: "I can't find the google doc someone else shared with me unless I star it"*

</div>
