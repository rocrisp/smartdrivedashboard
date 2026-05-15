"use client";

import { DriveFile } from "./google-drive";

const STORAGE_KEY = "smartdrive-hidden-files";

export interface HiddenFile {
  fileId: string;
  fileName: string;
  hiddenAt: string;
}

export class HiddenFilesManager {
  static getHiddenFiles(): HiddenFile[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load hidden files:", error);
      return [];
    }
  }

  static hideFile(file: DriveFile): void {
    const hidden = this.getHiddenFiles();
    const exists = hidden.some((h) => h.fileId === file.id);
    if (!exists) {
      hidden.push({
        fileId: file.id,
        fileName: file.name,
        hiddenAt: new Date().toISOString(),
      });
      this.saveHiddenFiles(hidden);
    }
  }

  static unhideFile(fileId: string): void {
    const hidden = this.getHiddenFiles();
    const updated = hidden.filter((h) => h.fileId !== fileId);
    this.saveHiddenFiles(updated);
  }

  static isHidden(fileId: string): boolean {
    const hidden = this.getHiddenFiles();
    return hidden.some((h) => h.fileId === fileId);
  }

  static getHiddenFileIds(): Set<string> {
    return new Set(this.getHiddenFiles().map((h) => h.fileId));
  }

  static clearAll(): void {
    this.saveHiddenFiles([]);
  }

  private static saveHiddenFiles(hidden: HiddenFile[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden));
      // Dispatch event for other components to listen
      window.dispatchEvent(new Event("hidden-files-updated"));
    } catch (error) {
      console.error("Failed to save hidden files:", error);
    }
  }
}
