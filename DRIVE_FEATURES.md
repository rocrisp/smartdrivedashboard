# Google Drive Dashboard - Feature Guide

## 🎯 What This Dashboard Does

This application solves the #1 problem with Google Drive: **finding files that others shared with you**.

### The Problem
- You can't find documents colleagues shared unless you star them
- Shared files are scattered and hard to organize  
- No easy way to see WHO shared WHAT with you
- Google Drive's recent files mix your files with shared files

### The Solution
A dedicated dashboard that organizes your Drive files intelligently.

---

## ✨ Features

### 1. Recently Viewed Files
**Keyboard shortcut:** Click "Recently Viewed" tab

Shows files you've accessed recently, sorted by when YOU viewed them (not when they were modified).

**Perfect for:**
- "I looked at that doc yesterday, where is it?"
- Quick access to files you're actively working on

### 2. Shared with Me
**Keyboard shortcut:** Click "Shared with Me" tab

Files shared with you, **grouped by who shared them**.

**Perfect for:**
- "What did Alice share with me this week?"
- Finding documents from specific team members
- Seeing all files a colleague has shared

### 3. Search Files
**Keyboard shortcut:** Press `/` or click "Search Files" tab

Full-text search across ALL your Drive files (name and content).

**Perfect for:**
- "I know there's a doc about 'Q4 planning' somewhere"
- Finding files when you can't remember who shared it
- Searching by keywords in document content

### 4. Bookmarks
**Keyboard shortcut:** Click "Bookmarks" tab

Bookmark important files for instant access. Bookmarks are stored locally on your computer.

**How to use:**
1. Hover over any file
2. Click the ⭐ star icon
3. Access bookmarked files from the Bookmarks tab

**Perfect for:**
- Frequently accessed files (team docs, templates, etc.)
- Important documents you reference often
- Files you don't want to lose track of

---

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Open search tab |
| `?` | Show help |
| `d` | Go to dashboard |
| `r` | Refresh page |
| `s` | Go to settings |

---

## 📖 How to Use

### First Time Setup

1. **Sign in with Google**
   - Click "Sign in with Google" on the landing page
   - Grant access to read your Drive files (read-only permissions)

2. **Wait for initial load**
   - The dashboard will fetch your recently viewed files
   - This may take a few seconds on first load

3. **Explore the tabs**
   - Click through each tab to see different views of your files
   - Try the search to find specific documents

### Daily Usage

**To find a file someone shared with you:**
1. Click "Shared with Me" tab
2. Look under the person's name who shared it
3. Click the file to open in Google Drive

**To search for a file:**
1. Press `/` or click "Search Files"
2. Type keywords from the file name or content
3. Press Enter or click Search

**To bookmark a file:**
1. Find the file in any tab
2. Hover over it
3. Click the ⭐ star icon that appears

**To access bookmarked files:**
1. Click "Bookmarks" tab
2. All your bookmarked files in one place
3. Click to open or remove bookmark

---

## 🔒 Privacy & Security

### What Access Does This App Have?

**Read-Only Access:**
- Can view file names, types, and metadata
- Can see who shared files with you
- Can see when you viewed files
- **CANNOT** modify, delete, or create files
- **CANNOT** access file content (only metadata)

### OAuth Scopes Used:
- `drive.readonly` - Read file metadata
- `drive.metadata.readonly` - Read file properties

### Where is Data Stored?

**On Google's Servers:**
- Your Drive files (unchanged)
- File metadata

**Locally on Your Computer:**
- Bookmarks (in browser localStorage)
- No file content is downloaded or stored

**In the Database:**
- Your email and name (from Google)
- Sign-in activity logs
- User preferences

### Can This App Access My Private Files?

The app can only see files you have access to in Google Drive. It uses YOUR Google account credentials, so it sees exactly what you would see in Google Drive.

---

## 🐛 Troubleshooting

### Files Not Loading
1. **Check your Google OAuth permissions**
   - Go to https://myaccount.google.com/permissions
   - Ensure this app has Drive access

2. **Refresh the connection**
   - Sign out and sign back in
   - This refreshes your access token

### "Unauthorized" Error
- Your session may have expired
- Sign out and sign back in

### Files Missing from "Shared with Me"
- The file may not actually be shared with you
- Check in Google Drive to confirm
- Try using Search instead

### Search Not Finding Files
- Search uses Google's Drive API
- It searches file names and content
- May take a moment for new files to be indexed

---

## 💡 Tips & Tricks

### Pro Tips

1. **Bookmark Your Frequently Used Files**
   - Use bookmarks for daily-use documents
   - Much faster than searching each time

2. **Use Search for One-Off Lookups**
   - Don't remember who shared it? Use search
   - Search works across all files, not just shared

3. **Check Recently Viewed Daily**
   - See what you've been working on
   - Quick access to active projects

4. **Organize by Sharer**
   - "Shared with Me" groups files by person
   - Great for team-specific documents

### File Type Indicators

Files show color-coded icons:
- 📄 **Blue** = Google Docs
- 📊 **Green** = Google Sheets  
- 📽️ **Orange** = Google Slides
- 📁 **Yellow** = Folders
- 🖼️ **Pink** = Images
- 🎥 **Red** = Videos
- 📎 **Gray** = Other files

---

## 🚀 Future Enhancements

Planned features:
- [ ] Filter files by type (Docs, Sheets, Slides)
- [ ] Sort options (by date, name, sharer)
- [ ] Tags for organizing bookmarks
- [ ] View history tracking (see how many times you viewed a file)
- [ ] Shared BY me (files you shared with others)
- [ ] Folder breadcrumbs and navigation
- [ ] Export bookmark list

---

## 📞 Need Help?

1. Press `?` in the dashboard for quick help
2. Check this guide for detailed information
3. Verify Google OAuth permissions if files won't load

**Enjoying the dashboard?** Star files you use often with bookmarks!
