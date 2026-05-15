"use client";

import { useState, useEffect } from "react";
import { DriveFile } from "@/lib/google-drive";
import { BookmarksManager } from "@/lib/bookmarks";
import { ViewHistoryManager } from "@/lib/view-history";
import { HiddenFilesManager } from "@/lib/hidden-files";
import { FileText, Sheet, Presentation, Folder, Link2, File, Image, Video, Star, EyeOff } from "lucide-react";

interface DriveFileListProps {
  files: DriveFile[];
  groupBy?: "sharer" | "type" | "none";
  showHidden?: boolean;
}

export function DriveFileList({ files, groupBy = "none", showHidden = false }: DriveFileListProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load bookmarked status for all files
    const bookmarks = BookmarksManager.getBookmarks();
    setBookmarkedIds(new Set(bookmarks.map((b) => b.fileId)));

    // Load hidden files
    const hidden = HiddenFilesManager.getHiddenFileIds();
    setHiddenIds(hidden);

    // Listen for bookmark changes
    const handleBookmarkUpdate = () => {
      const updated = BookmarksManager.getBookmarks();
      setBookmarkedIds(new Set(updated.map((b) => b.fileId)));
    };

    // Listen for hidden files changes
    const handleHiddenUpdate = () => {
      const updated = HiddenFilesManager.getHiddenFileIds();
      setHiddenIds(updated);
    };

    window.addEventListener("bookmarks-updated", handleBookmarkUpdate);
    window.addEventListener("hidden-files-updated", handleHiddenUpdate);
    return () => {
      window.removeEventListener("bookmarks-updated", handleBookmarkUpdate);
      window.removeEventListener("hidden-files-updated", handleHiddenUpdate);
    };
  }, []);

  const toggleBookmark = (file: DriveFile, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (bookmarkedIds.has(file.id)) {
      BookmarksManager.removeBookmark(file.id);
    } else {
      BookmarksManager.addBookmark(file);
    }

    // Trigger update
    window.dispatchEvent(new Event("bookmarks-updated"));
  };

  const toggleHidden = (file: DriveFile, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hiddenIds.has(file.id)) {
      HiddenFilesManager.unhideFile(file.id);
    } else {
      HiddenFilesManager.hideFile(file);
    }

    // Trigger update
    window.dispatchEvent(new Event("hidden-files-updated"));
  };

  const handleFileClick = (file: DriveFile) => {
    // Track the view
    ViewHistoryManager.trackView(file);
  };

  const handleDragStart = (e: React.DragEvent, file: DriveFile) => {
    e.dataTransfer.setData("fileId", file.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("document")) return <FileText className="w-5 h-5 text-blue-600" />;
    if (mimeType.includes("spreadsheet")) return <Sheet className="w-5 h-5 text-green-600" />;
    if (mimeType.includes("presentation")) return <Presentation className="w-5 h-5 text-orange-600" />;
    if (mimeType.includes("folder")) return <Folder className="w-5 h-5 text-yellow-600" />;
    if (mimeType.includes("shortcut")) return <Link2 className="w-5 h-5 text-purple-600" />;
    if (mimeType.startsWith("image/")) return <Image className="w-5 h-5 text-pink-600" />;
    if (mimeType.startsWith("video/")) return <Video className="w-5 h-5 text-red-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const groupedFiles = () => {
    // Filter hidden files unless showHidden is true
    const visibleFiles = showHidden
      ? files
      : files.filter(file => !hiddenIds.has(file.id));

    if (groupBy === "sharer") {
      const groups: Record<string, DriveFile[]> = {};
      visibleFiles.forEach((file) => {
        const sharer = file.sharingUser?.displayName || "Unknown";
        if (!groups[sharer]) groups[sharer] = [];
        groups[sharer].push(file);
      });
      return groups;
    }
    if (groupBy === "type") {
      const groups: Record<string, DriveFile[]> = {};
      visibleFiles.forEach((file) => {
        const type = getFileType(file.mimeType);
        if (!groups[type]) groups[type] = [];
        groups[type].push(file);
      });
      return groups;
    }
    return { "All Files": visibleFiles };
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.includes("document")) return "Documents";
    if (mimeType.includes("spreadsheet")) return "Spreadsheets";
    if (mimeType.includes("presentation")) return "Presentations";
    if (mimeType.includes("folder")) return "Folders";
    if (mimeType.startsWith("image/")) return "Images";
    if (mimeType.startsWith("video/")) return "Videos";
    if (mimeType.includes("pdf")) return "PDFs";
    return "Other";
  };

  const groups = groupedFiles();

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No files found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([groupName, groupFiles]) => (
        <div key={groupName}>
          {groupBy !== "none" && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {groupName} ({groupFiles.length})
            </h3>
          )}
          <div className="space-y-2">
            {groupFiles.map((file) => (
              <div
                key={file.id}
                className="relative group"
                draggable
                onDragStart={(e) => handleDragStart(e, file)}
              >
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleFileClick(file)}
                  className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-move"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate pr-8">
                        {file.name}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {file.sharingUser && (
                          <span>Shared by {file.sharingUser.displayName}</span>
                        )}
                        {file.viewedByMeTime && (
                          <span>Viewed {formatDate(file.viewedByMeTime)}</span>
                        )}
                        <span>Modified {formatDate(file.modifiedTime)}</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => toggleHidden(file, e)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={hiddenIds.has(file.id) ? "Unhide file" : "Hide file"}
                      >
                        <EyeOff
                          className={`w-5 h-5 ${
                            hiddenIds.has(file.id)
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => toggleBookmark(file, e)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={bookmarkedIds.has(file.id) ? "Remove bookmark" : "Add bookmark"}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            bookmarkedIds.has(file.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
