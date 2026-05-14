"use client";

import { useState } from "react";
import { FileText, Sheet, Presentation, Image, Video, File } from "lucide-react";

import { DriveFile } from "@/lib/google-drive";

export type FileType = "all" | "docs" | "sheets" | "slides" | "images" | "videos" | "pdfs" | "other";

interface FileTypeFilterProps {
  onFilterChange: (type: FileType) => void;
  activeFilter: FileType;
  files?: DriveFile[];
}

export function FileTypeFilter({ onFilterChange, activeFilter, files }: FileTypeFilterProps) {
  const getCountForType = (type: FileType): number => {
    if (!files || type === "all") return files?.length || 0;
    return files.filter(f => getFileTypeFromMime(f.mimeType) === type).length;
  };

  const filters = [
    { type: "all" as FileType, label: "All Files", icon: <File className="w-4 h-4" /> },
    { type: "docs" as FileType, label: "Docs", icon: <FileText className="w-4 h-4" /> },
    { type: "sheets" as FileType, label: "Sheets", icon: <Sheet className="w-4 h-4" /> },
    { type: "slides" as FileType, label: "Slides", icon: <Presentation className="w-4 h-4" /> },
    { type: "images" as FileType, label: "Images", icon: <Image className="w-4 h-4" /> },
    { type: "videos" as FileType, label: "Videos", icon: <Video className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const count = files ? getCountForType(filter.type) : null;
        return (
          <button
            key={filter.type}
            onClick={() => onFilterChange(filter.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeFilter === filter.type
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
            {count !== null && <span className="text-xs opacity-75">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}

export function getFileTypeFromMime(mimeType: string): FileType {
  if (mimeType.includes("document")) return "docs";
  if (mimeType.includes("spreadsheet")) return "sheets";
  if (mimeType.includes("presentation")) return "slides";
  if (mimeType.startsWith("image/")) return "images";
  if (mimeType.startsWith("video/")) return "videos";
  if (mimeType.includes("pdf")) return "pdfs";
  return "other";
}

export function getMimeTypeFromFilter(filter: FileType): string | undefined {
  const mimeMap: Record<FileType, string | undefined> = {
    all: undefined,
    docs: "application/vnd.google-apps.document",
    sheets: "application/vnd.google-apps.spreadsheet",
    slides: "application/vnd.google-apps.presentation",
    images: undefined, // Will handle with prefix search
    videos: undefined, // Will handle with prefix search
    pdfs: "application/pdf",
    other: undefined,
  };
  return mimeMap[filter];
}
