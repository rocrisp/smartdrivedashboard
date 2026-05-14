"use client";

import { useState, useEffect } from "react";
import { ViewHistoryManager, ViewHistoryEntry } from "@/lib/view-history";
import { Card, CardHeader } from "@/components/ui/Card";
import { History, ExternalLink, Trash2, FileText, Sheet, Presentation, File, ArrowUpDown } from "lucide-react";

type SortOption = "recent" | "name";

export function ViewHistory() {
  const [history, setHistory] = useState<ViewHistoryEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const allHistory = ViewHistoryManager.getHistory();
    const sorted = [...allHistory].sort((a, b) => {
      if (sortBy === "name") {
        return a.fileName.localeCompare(b.fileName);
      }
      // Default: most recent first
      return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
    });
    setHistory(sorted);
  };

  useEffect(() => {
    loadHistory();
  }, [sortBy]);

  const removeEntry = (fileId: string) => {
    ViewHistoryManager.removeEntry(fileId);
    loadHistory();
  };

  const clearAll = () => {
    if (confirm("Clear all view history? This cannot be undone.")) {
      ViewHistoryManager.clearHistory();
      loadHistory();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("document")) return <FileText className="w-5 h-5 text-blue-600" />;
    if (mimeType.includes("spreadsheet")) return <Sheet className="w-5 h-5 text-green-600" />;
    if (mimeType.includes("presentation")) return <Presentation className="w-5 h-5 text-orange-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  return (
    <Card>
      <CardHeader
        icon={<History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
        title={`View History (${history.length})`}
        iconBgColor="bg-indigo-100 dark:bg-indigo-900"
      >
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Recently Viewed</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </CardHeader>

      <div className="mt-4">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No view history yet</p>
            <p className="text-sm mt-1">Files you open will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={`${entry.fileId}-${entry.viewedAt}`}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(entry.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {entry.fileName}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>Viewed {formatDate(entry.viewedAt)}</span>
                      {entry.sharingUser && (
                        <span>• Shared by {entry.sharingUser.displayName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={entry.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Open file"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </a>
                  <button
                    onClick={() => removeEntry(entry.fileId)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Remove from history"
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
