# SmartDrive Dashboard

A floating window interface for managing your Google Drive files with intelligent organization. Never lose track of shared documents again!

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

## The Problem

Google Drive's default UI makes it difficult to:
- Find files that others have shared with you
- Distinguish file types at a glance
- Remember where you saw a document before
- Organize files the way you want

## The Solution

SmartDrive Dashboard provides a better way to access your Google Drive files:

- **Two Floating Windows** - Files and Virtual Buckets that you can drag and position anywhere
- **Six Smart Tabs** - Recently Viewed, Shared with Me, Search, Bookmarks, View History, and Hidden Files
- **Virtual Buckets** - Drag files into custom collections for your own organization
- **Hide Files** - Declutter your views by hiding files you don't need to see
- **Sticky Tabs** - Tabs stay visible while scrolling through long file lists
- **Smart Organization** - See who shared what, filter by type, search everything

## ✨ Features

### File Management
- 📁 **Find Shared Files** - See all files shared with you, grouped by who shared them
- 🔍 **Smart Search** - Full-text search with file type filtering
- ⭐ **Bookmarks** - Star important files for quick access
- 👁️ **Hide Files** - Clean up your views by hiding unwanted files
- 🗂️ **Virtual Buckets** - Create custom collections and drag files to organize them
- 🕒 **View History** - Track every file you've opened with timestamps

### Interface
- 🪟 **Floating Windows** - Drag and resize windows to arrange your workspace
- 📌 **Sticky Tabs** - Tabs stay visible when scrolling
- 🎨 **Color-Coded Files** - Docs (blue), Sheets (green), Slides (orange), and more
- 🌙 **Dark Mode** - Light, Dark, or System theme
- ⌨️ **Keyboard Shortcuts** - Navigate quickly with keyboard
- 📱 **Responsive** - Works on desktop, tablet, and mobile

### Privacy & Security
- 🔐 **Read-Only Access** - Never modifies your files
- 💾 **Local Storage** - Your bookmarks and history stay in your browser
- 🔒 **Secure OAuth** - Google authentication with minimal permissions
- 🚫 **No Tracking** - No analytics or data collection

## 🚀 Getting Started

### Option 1: Docker (Recommended)

The easiest way to run SmartDrive Dashboard:

```bash
# Clone the repository
git clone https://github.com/rocrisp/smartdrivedashboard.git
cd smartdrivedashboard

# Set up environment variables
cp .env.example .env
# Edit .env with your Google OAuth credentials

# Start with Docker
docker-compose up -d
```

Visit http://localhost:3000 and sign in with Google.

**See [README.Docker.md](README.Docker.md) for complete Docker instructions.**

### Option 2: Local Development

```bash
npm install
npm run dev
```

**See [SETUP.md](SETUP.md) for detailed setup instructions including Google OAuth configuration.**

## 📱 How to Use

### The Files Window

Switch between six tabs to view different aspects of your Drive:

**1. Recently Viewed** - Files you've opened recently
**2. Shared with Me** - Files others have shared, grouped by person
**3. Search Files** - Search all your Drive files
**4. Bookmarks** - Files you've starred for quick access
**5. View History** - Complete timeline of files you've viewed
**6. Hidden Files** - Manage files you've hidden from view

### The Virtual Buckets Window

Create custom collections to organize your files:
- Click "New" to create a bucket with a name and color
- Drag any file from the Files window into a bucket
- Expand buckets to see and manage the files inside
- Click on files to open them, or remove them from buckets

### File Actions

Hover over any file to see action buttons:
- 👁️ **Hide/Unhide** - Remove from normal views (eye icon)
- ⭐ **Bookmark** - Add to bookmarks tab (star icon)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show help |
| `d` | Go to Dashboard |
| `s` | Go to Settings |
| `/` | Focus search |
| `r` | Refresh page |

## 🎨 File Type Colors

Files are color-coded for quick recognition:

| Type | Color |
|------|-------|
| Google Docs | Blue 📄 |
| Google Sheets | Green 📊 |
| Google Slides | Orange 📽️ |
| Images | Pink 🖼️ |
| Videos | Red 🎥 |
| PDFs | Gray 📕 |
| Folders | Yellow 📁 |

## 🔒 Privacy

SmartDrive Dashboard is designed with privacy in mind:

- **Read-Only** - Only reads file metadata, never modifies anything
- **Local Storage** - Bookmarks, hidden files, and history stored only in your browser
- **No Backend** - No server storing your data
- **Minimal Permissions** - Only requests Drive read access
- **No Tracking** - No analytics or user tracking

## 📚 Documentation

- [README.Docker.md](README.Docker.md) - Docker deployment guide
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [DRIVE_FEATURES.md](DRIVE_FEATURES.md) - Complete user guide

## 🤝 Contributing

Contributions are welcome! This project demonstrates modern Next.js patterns with Google Drive integration.

## 📄 License

MIT License - free to use and modify.

---

<div align="center">

Built with ❤️ using Next.js, TypeScript, and Google Drive API

*Solving the problem: "I can't find files others shared with me unless I star them"*

[GitHub](https://github.com/rocrisp/smartdrivedashboard) • [Report Bug](https://github.com/rocrisp/smartdrivedashboard/issues)

</div>
