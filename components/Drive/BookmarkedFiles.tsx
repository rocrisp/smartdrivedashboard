"use client";

import { useState, useEffect } from "react";
import { BookmarksManager, Bookmark } from "@/lib/bookmarks";
import { Card, CardHeader } from "@/components/ui/Card";
import { Star, Trash2, ExternalLink, ArrowUpDown } from "lucide-react";

type SortOption = "recent" | "name";

export function BookmarkedFiles() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  useEffect(() => {
    loadBookmarks();

    // Listen for bookmark changes
    const handleStorage = () => loadBookmarks();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("bookmarks-updated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("bookmarks-updated", handleStorage);
    };
  }, []);

  const loadBookmarks = () => {
    const allBookmarks = BookmarksManager.getBookmarks();
    const sorted = [...allBookmarks].sort((a, b) => {
      if (sortBy === "name") {
        return a.fileName.localeCompare(b.fileName);
      }
      // Default: most recent first
      return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime();
    });
    setBookmarks(sorted);
  };

  useEffect(() => {
    loadBookmarks();
  }, [sortBy]);

  const removeBookmark = (fileId: string) => {
    BookmarksManager.removeBookmark(fileId);
    loadBookmarks();
    window.dispatchEvent(new Event("bookmarks-updated"));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader
        icon={<Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
        title={`Bookmarked Files (${bookmarks.length})`}
        iconBgColor="bg-yellow-100 dark:bg-yellow-900"
      >
        {bookmarks.length > 0 && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Recently Bookmarked</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        )}
      </CardHeader>

      <div className="mt-4">
        {bookmarks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No bookmarked files yet</p>
            <p className="text-sm mt-1">Click the star icon on any file to bookmark it</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.fileId}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-yellow-500 dark:hover:border-yellow-400 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {bookmark.fileName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Bookmarked {formatDate(bookmark.bookmarkedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={bookmark.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Open file"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </a>
                  <button
                    onClick={() => removeBookmark(bookmark.fileId)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
