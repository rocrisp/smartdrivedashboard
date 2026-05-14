"use client";

import { useState, useEffect } from "react";
import { DriveFile } from "@/lib/google-drive";
import { DriveFileList } from "./DriveFileList";
import { FileTypeFilter, FileType, getFileTypeFromMime } from "./FileTypeFilter";
import { Card, CardHeader } from "@/components/ui/Card";
import { Search, X } from "lucide-react";

export function FileSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FileType>("all");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const response = await fetch(`/api/drive/search?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        throw new Error("Failed to search files");
      }

      const data = await response.json();
      setFiles(data.files || []);
      setFilteredFiles(data.files || []);
      setActiveFilter("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search files");
      console.error("Error searching files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredFiles(files);
    } else {
      setFilteredFiles(files.filter((file) => getFileTypeFromMime(file.mimeType) === activeFilter));
    }
  }, [activeFilter, files]);

  const clearSearch = () => {
    setSearchQuery("");
    setFiles([]);
    setFilteredFiles([]);
    setHasSearched(false);
    setError(null);
    setActiveFilter("all");
  };

  return (
    <Card>
      <CardHeader
        icon={<Search className="w-6 h-6 text-green-600 dark:text-green-400" />}
        title="Search Files"
        iconBgColor="bg-green-100 dark:bg-green-900"
      />

      <div className="mt-4">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files by name or content..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {hasSearched && !loading && (
          <>
            {files.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Found {files.length} file{files.length !== 1 ? "s" : ""}
                    {activeFilter !== "all" && ` • Showing ${filteredFiles.length} ${activeFilter}`}
                  </p>
                  <FileTypeFilter onFilterChange={setActiveFilter} activeFilter={activeFilter} files={files} />
                </div>
                <DriveFileList files={filteredFiles} groupBy="none" />
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No files found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </>
        )}

        {!hasSearched && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Search for files by name or content</p>
          </div>
        )}
      </div>
    </Card>
  );
}
