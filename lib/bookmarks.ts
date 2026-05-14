import { DriveFile } from "./google-drive";

const BOOKMARKS_KEY = "drive_bookmarks";

export interface Bookmark {
  fileId: string;
  fileName: string;
  fileType: string;
  bookmarkedAt: string;
  webViewLink: string;
}

export class BookmarksManager {
  static getBookmarks(): Bookmark[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
      return [];
    }
  }

  static addBookmark(file: DriveFile): void {
    const bookmarks = this.getBookmarks();

    // Check if already bookmarked
    if (bookmarks.some((b) => b.fileId === file.id)) {
      return;
    }

    const newBookmark: Bookmark = {
      fileId: file.id,
      fileName: file.name,
      fileType: file.mimeType,
      bookmarkedAt: new Date().toISOString(),
      webViewLink: file.webViewLink,
    };

    bookmarks.unshift(newBookmark);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }

  static removeBookmark(fileId: string): void {
    const bookmarks = this.getBookmarks();
    const filtered = bookmarks.filter((b) => b.fileId !== fileId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  }

  static isBookmarked(fileId: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some((b) => b.fileId === fileId);
  }

  static clearAll(): void {
    localStorage.removeItem(BOOKMARKS_KEY);
  }
}
