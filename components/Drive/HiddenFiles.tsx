"use client";

import { useState, useEffect } from "react";
import { HiddenFilesManager, HiddenFile } from "@/lib/hidden-files";
import { Eye, Trash2, FileText } from "lucide-react";

export function HiddenFiles() {
  const [hiddenFiles, setHiddenFiles] = useState<HiddenFile[]>([]);

  useEffect(() => {
    loadHiddenFiles();

    const handleUpdate = () => {
      loadHiddenFiles();
    };

    window.addEventListener("hidden-files-updated", handleUpdate);
    return () => window.removeEventListener("hidden-files-updated", handleUpdate);
  }, []);

  const loadHiddenFiles = () => {
    const hidden = HiddenFilesManager.getHiddenFiles();
    setHiddenFiles(hidden);
  };

  const handleUnhide = (fileId: string) => {
    HiddenFilesManager.unhideFile(fileId);
    window.dispatchEvent(new Event("hidden-files-updated"));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to unhide all files?")) {
      HiddenFilesManager.clearAll();
      window.dispatchEvent(new Event("hidden-files-updated"));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (hiddenFiles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No hidden files</p>
        <p className="text-sm mt-2">Files you hide will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {hiddenFiles.length} hidden {hiddenFiles.length === 1 ? "file" : "files"}
        </p>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Unhide All
        </button>
      </div>

      <div className="space-y-2">
        {hiddenFiles.map((file) => (
          <div
            key={file.fileId}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {file.fileName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hidden {formatDate(file.hiddenAt)}
              </p>
            </div>
            <button
              onClick={() => handleUnhide(file.fileId)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
            >
              <Eye className="w-4 h-4" />
              Unhide
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
