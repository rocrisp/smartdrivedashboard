"use client";

import { useEffect, useState } from "react";
import { DriveFile } from "@/lib/google-drive";
import { DriveFileList } from "./DriveFileList";
import { FileTypeFilter, FileType, getFileTypeFromMime } from "./FileTypeFilter";
import { Card, CardHeader } from "@/components/ui/Card";
import { Clock, RefreshCw, ArrowUpDown } from "lucide-react";

type SortOption = "recent" | "name" | "modified";

export function RecentlyViewed() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FileType>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/drive/recently-viewed");

      if (!response.ok) {
        throw new Error("Failed to fetch recently viewed files");
      }

      const data = await response.json();
      setFiles(data.files || []);
      setFilteredFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
      console.error("Error fetching recently viewed files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    let filtered = files;

    // Apply type filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((file) => getFileTypeFromMime(file.mimeType) === activeFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "modified":
          const modA = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
          const modB = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
          return modB - modA;
        case "recent":
        default:
          const viewA = a.viewedByMeTime ? new Date(a.viewedByMeTime).getTime() : 0;
          const viewB = b.viewedByMeTime ? new Date(b.viewedByMeTime).getTime() : 0;
          return viewB - viewA;
      }
    });

    setFilteredFiles(sorted);
  }, [activeFilter, files, sortBy]);

  return (
    <Card>
      <CardHeader
        icon={<Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
        title={`Recently Viewed (${files.length})`}
        iconBgColor="bg-purple-100 dark:bg-purple-900"
      >
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </CardHeader>

      <div className="mt-4">
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <FileTypeFilter onFilterChange={setActiveFilter} activeFilter={activeFilter} files={files} />

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Recently Viewed</option>
              <option value="name">Name (A-Z)</option>
              <option value="modified">Last Modified</option>
            </select>
          </div>
        </div>

        {loading && files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : (
          <DriveFileList files={filteredFiles} groupBy="none" />
        )}
      </div>
    </Card>
  );
}
