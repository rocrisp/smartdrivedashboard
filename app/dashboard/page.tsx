"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SharedWithMe } from "@/components/Drive/SharedWithMe";
import { RecentlyViewed } from "@/components/Drive/RecentlyViewed";
import { FileSearch } from "@/components/Drive/FileSearch";
import { BookmarkedFiles } from "@/components/Drive/BookmarkedFiles";
import { ViewHistory } from "@/components/Drive/ViewHistory";
import { CollectionsSidebar } from "@/components/Drive/CollectionsSidebar";
import { FloatingHelpButton } from "@/components/FloatingHelpButton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import { Clock, Users, Search, Star, History, FolderOpen } from "lucide-react";
import { IntelligenceManager } from "@/lib/intelligence/intelligence-manager";
import { DriveFile } from "@/lib/google-drive";

type Tab = "recent" | "shared" | "search" | "bookmarks" | "history";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("recent");
  const [allFiles, setAllFiles] = useState<DriveFile[]>([]);
  const [showBuckets, setShowBuckets] = useState(true);
  const [showFilesWindow, setShowFilesWindow] = useState(true);
  const [filesWindowCollapsed, setFilesWindowCollapsed] = useState(false);
  const [filesWindowPosition, setFilesWindowPosition] = useState({ x: 50, y: 150 });
  const [filesWindowSize, setFilesWindowSize] = useState({ width: 900, height: 650 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Initialize intelligence system
  useEffect(() => {
    IntelligenceManager.initialize();
  }, []);

  // Load all files for sidebar
  useEffect(() => {
    const loadAllFiles = async () => {
      if (!session) return;
      try {
        const response = await fetch("/api/drive/recently-viewed?pageSize=100");
        if (response.ok) {
          const data = await response.json();
          setAllFiles(data.files || []);
        }
      } catch (error) {
        console.error("Failed to load files:", error);
      }
    };
    loadAllFiles();
  }, [session]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: "?",
        action: () => {
          const helpButton = document.querySelector('[aria-label*="help"]') as HTMLButtonElement;
          if (helpButton) helpButton.click();
        },
        description: "Show help modal",
      },
      {
        key: "d",
        action: () => router.push("/dashboard"),
        description: "Go to Dashboard",
      },
      {
        key: "s",
        action: () => router.push("/settings"),
        description: "Go to Settings",
      },
      {
        key: "e",
        action: () => router.push("/sessions"),
        description: "Go to Sessions",
      },
      {
        key: "r",
        action: () => window.location.reload(),
        description: "Refresh page",
      },
      {
        key: "/",
        action: () => setActiveTab("search"),
        description: "Focus search",
      },
    ],
    !!session
  );

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: "recent" as Tab, label: "Recently Viewed", icon: <Clock className="w-4 h-4" /> },
    { id: "shared" as Tab, label: "Shared with Me", icon: <Users className="w-4 h-4" /> },
    { id: "search" as Tab, label: "Search Files", icon: <Search className="w-4 h-4" /> },
    { id: "bookmarks" as Tab, label: "Bookmarks", icon: <Star className="w-4 h-4" /> },
    { id: "history" as Tab, label: "View History", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* Main Content */}
      <main id="main-content" className="flex-1 relative" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Window Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Windows</h2>
            <button
              onClick={() => setShowFilesWindow(!showFilesWindow)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showFilesWindow
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Files</span>
            </button>
            <button
              onClick={() => setShowBuckets(!showBuckets)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showBuckets
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm">Virtual Buckets</span>
            </button>
          </div>
        </div>

        {/* Files Window with Tabs */}
        {showFilesWindow && (
          <FloatingWindow
            title="Files"
            icon={<Search className="w-5 h-5" />}
            defaultPosition={filesWindowPosition}
            defaultSize={filesWindowSize}
            onClose={() => setShowFilesWindow(false)}
            isCollapsed={filesWindowCollapsed}
            onToggleCollapse={() => setFilesWindowCollapsed(!filesWindowCollapsed)}
            onPositionChange={setFilesWindowPosition}
            onSizeChange={setFilesWindowSize}
          >
            {/* Tabs inside window */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap border-b-2 ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === "recent" && <RecentlyViewed />}
              {activeTab === "shared" && <SharedWithMe />}
              {activeTab === "search" && <FileSearch />}
              {activeTab === "bookmarks" && <BookmarkedFiles />}
              {activeTab === "history" && <ViewHistory />}
            </div>
          </FloatingWindow>
        )}

        {/* Virtual Buckets Window */}
        <CollectionsSidebar
          allFiles={allFiles}
          isVisible={showBuckets}
          onClose={() => setShowBuckets(false)}
        />
      </main>

      <Footer />
      <FloatingHelpButton />
    </div>
  );
}
