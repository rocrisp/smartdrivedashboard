---
name: mygoogledashboard
description: A personal Google Drive navigator and dashboard that makes finding, organizing, and revisiting files intuitive.
metadata:
  audience: personal
  domain: productivity
  stack: python, jupyter, google-api
---

## Project Purpose

Google Drive's default UI is difficult to navigate — shared documents are scattered, file types are mixed together, and there's no good way to remember where something was seen before. This project builds a **personal Google Drive dashboard** that surfaces the right files at the right time, with clear organization by type, recency, and collaborator.

## Core Problems to Solve

1. **Can't find files I've seen before** — need a "recently visited" and "search history" layer on top of Drive's own recency.
2. **Shared files are not intuitive** — files shared *with* me vs. files I shared are mixed together, and ownership is unclear.
3. **File types are hard to distinguish at a glance** — Docs, Sheets, Slides, PDFs, folders, shortcuts all look the same.
4. **Deep folder trees are hard to navigate** — no breadcrumb memory, no bookmarks, no quick-jump.

## Key Features

### Phase 1 — Read-Only Dashboard (Start Here)
- [ ] Authenticate with Google Drive API (OAuth2, read-only scope)
- [ ] Fetch and cache file metadata (name, type, owner, modifiedTime, viewedByMeTime, shared, parents)
- [ ] Display a **"Recently Viewed by Me"** list (sorted by `viewedByMeTime`)
- [ ] Display a **"Shared with Me"** panel, grouped by who shared it
- [ ] Display a **"My Files"** panel, grouped by MIME type
- [ ] Color-code / icon-tag by file type (Doc, Sheet, Slide, PDF, Folder, Image, Video, Other)
- [ ] Show file owner and last-modified timestamp prominently
- [ ] Clickable links that open the file directly in the browser

### Phase 2 — Search & Bookmarks
- [ ] Full-text search over cached metadata (name, owner, shared-by)
- [ ] Filter by: file type, owner (me / others), date range, shared status
- [ ] **Bookmark / pin** files to a personal quick-access list (stored locally)
- [ ] **Tag files** with personal labels (stored locally, not written back to Drive)

### Phase 3 — History & Intelligence
- [ ] Log every time a file is opened from the dashboard (local SQLite history)
- [ ] "You visited this 3 times last week" contextual hints
- [ ] Suggest files based on day-of-week / time-of-day patterns
- [ ] Detect stale shared files (shared >90 days ago, never opened)

## Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | Python 3.11+ | Fast iteration, rich ecosystem |
| Notebook | Jupyter | Exploratory development, easy to demo |
| Google API | `google-api-python-client` + `google-auth-oauthlib` | Official SDK |
| Data layer | `pandas` for in-memory, `sqlite3` for persistence | Lightweight, no server needed |
| UI (notebook) | `ipywidgets` + `IPython.display` | Interactive in Jupyter |
| UI (web, later) | Streamlit or Panel | Quick Python-native web app |
| Visualization | `matplotlib` / `seaborn` | File type breakdown charts, activity timeline |

## Google Drive API Essentials

- **Scopes needed (read-only):**
  - `https://www.googleapis.com/auth/drive.metadata.readonly` — list and read file metadata
  - `https://www.googleapis.com/auth/drive.readonly` — read file content (Phase 2+)

- **Key API fields to fetch:**
  ```
  id, name, mimeType, owners, sharingUser, shared, viewedByMeTime,
  modifiedTime, modifiedByMeTime, parents, webViewLink, iconLink,
  capabilities/canEdit, size
  ```

- **MIME type map (Google Workspace):**
  | MIME type | Label |
  |---|---|
  | `application/vnd.google-apps.document` | Doc |
  | `application/vnd.google-apps.spreadsheet` | Sheet |
  | `application/vnd.google-apps.presentation` | Slides |
  | `application/vnd.google-apps.folder` | Folder |
  | `application/vnd.google-apps.shortcut` | Shortcut |
  | `application/pdf` | PDF |
  | `image/*` | Image |
  | `video/*` | Video |

- **Rate limits:** 1,000 queries/100 seconds per user. Cache aggressively; refresh metadata at most every 15 minutes.

## Credentials Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google Drive API**
3. Create OAuth 2.0 credentials (Desktop app type)
4. Download `credentials.json` → place at project root (never commit this)
5. First run generates `token.json` (also gitignored)

## Project Structure

```
mygoogledashboard/
├── CLAUDE.md                  ← this file
├── credentials.json           ← OAuth client secret (gitignored)
├── token.json                 ← OAuth token cache (gitignored)
├── .gitignore
├── requirements.txt
├── data/
│   ├── file_cache.parquet     ← cached Drive metadata
│   └── history.sqlite         ← local view/bookmark history
├── notebooks/
│   ├── 01_auth_and_fetch.ipynb
│   ├── 02_dashboard.ipynb
│   └── 03_search_and_filter.ipynb
└── src/
    ├── auth.py                ← Google OAuth flow
    ├── drive_client.py        ← API wrapper, caching logic
    ├── models.py              ← DriveFile dataclass, MIME helpers
    └── history.py             ← local SQLite history tracker
```

## Conventions

- **Never write back to Drive** in Phase 1 or 2. All mutations (bookmarks, tags, history) are local only.
- **Cache first**: always load from `file_cache.parquet`; only call the API to refresh.
- **Pandas for analysis**: represent the file list as a `pd.DataFrame` with typed columns (`modifiedTime` as `datetime64`, `mimeType` as `pd.CategoricalDtype`).
- **Reproducible notebooks**: each notebook must run top-to-bottom without manual steps (after auth).
- **Secrets out of code**: load `credentials.json` path from environment variable `GDRIVE_CREDENTIALS_PATH`, defaulting to `./credentials.json`.

## Data Quality Rules

- Drop rows where `name` is null or empty.
- Parse all timestamps to UTC `datetime64[ns]`.
- Normalize `owners` to a single `owner_email` string (take `owners[0].emailAddress`).
- If `viewedByMeTime` is missing, treat as `NaT` (never viewed by me).
- Flag files with `mimeType == 'application/vnd.google-apps.shortcut'` separately — they point elsewhere and need the `shortcutDetails.targetId` field.

## Success Criteria

- I can open the dashboard and within 5 seconds see the 20 files I most recently touched.
- Shared files show *who* shared them with me, not just that they're shared.
- I can filter to "only Sheets shared by alice@example.com" in two clicks.
- Files I've bookmarked appear at the top regardless of recency.
- The whole thing works offline using the last cached metadata fetch.
