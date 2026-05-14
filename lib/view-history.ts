import { DriveFile } from "./google-drive";

const HISTORY_KEY = "drive_view_history";
const MAX_HISTORY = 100;

export interface ViewHistoryEntry {
  fileId: string;
  fileName: string;
  fileType: string;
  viewedAt: string;
  webViewLink: string;
  sharingUser?: { displayName: string; emailAddress: string };
}

export class ViewHistoryManager {
  static getHistory(): ViewHistoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load view history:", error);
      return [];
    }
  }

  static trackView(file: DriveFile): void {
    const history = this.getHistory();

    // Remove existing entry for this file
    const filtered = history.filter((entry) => entry.fileId !== file.id);

    // Add to beginning
    const newEntry: ViewHistoryEntry = {
      fileId: file.id,
      fileName: file.name,
      fileType: file.mimeType,
      viewedAt: new Date().toISOString(),
      webViewLink: file.webViewLink,
      sharingUser: file.sharingUser,
    };

    filtered.unshift(newEntry);

    // Keep only last MAX_HISTORY entries
    const trimmed = filtered.slice(0, MAX_HISTORY);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }

  static getViewCount(fileId: string): number {
    const history = this.getHistory();
    return history.filter((entry) => entry.fileId === fileId).length;
  }

  static clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  static removeEntry(fileId: string): void {
    const history = this.getHistory();
    const filtered = history.filter((entry) => entry.fileId !== fileId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  }
}
