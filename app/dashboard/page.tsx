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
  const [collapsedWindows, setCollapsedWindows] = useState<Record<Tab, boolean>>({
    recent: false,
    shared: false,
    search: false,
    bookmarks: false,
    history: false,
  });

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
    { id: "recent" as Tab, label: "Recently Viewed", icon: <Clock className="w-5 h-5" /> },
    { id: "shared" as Tab, label: "Shared with Me", icon: <Users className="w-5 h-5" /> },
    { id: "search" as Tab, label: "Search Files", icon: <Search className="w-5 h-5" /> },
    { id: "bookmarks" as Tab, label: "Bookmarks", icon: <Star className="w-5 h-5" /> },
    { id: "history" as Tab, label: "View History", icon: <History className="w-5 h-5" /> },
  ];

  const toggleWindow = (tab: Tab) => {
    setCollapsedWindows(prev => ({ ...prev, [tab]: !prev[tab] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* Main Content */}
      <main id="main-content" className="flex-1 relative" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Window Controls */}
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Windows</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (collapsedWindows[tab.id]) {
                      toggleWindow(tab.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id && !collapsedWindows[tab.id]
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
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
        </div>

        {/* Floating Windows */}
        {activeTab === "recent" && (
          <FloatingWindow
            title="Recently Viewed"
            icon={<Clock className="w-5 h-5" />}
            defaultPosition={{ x: 50, y: 150 }}
            defaultSize={{ width: 800, height: 600 }}
            isCollapsed={collapsedWindows.recent}
            onToggleCollapse={() => toggleWindow("recent")}
          >
            <RecentlyViewed />
          </FloatingWindow>
        )}

        {activeTab === "shared" && (
          <FloatingWindow
            title="Shared with Me"
            icon={<Users className="w-5 h-5" />}
            defaultPosition={{ x: 50, y: 150 }}
            defaultSize={{ width: 800, height: 600 }}
            isCollapsed={collapsedWindows.shared}
            onToggleCollapse={() => toggleWindow("shared")}
          >
            <SharedWithMe />
          </FloatingWindow>
        )}

        {activeTab === "search" && (
          <FloatingWindow
            title="Search Files"
            icon={<Search className="w-5 h-5" />}
            defaultPosition={{ x: 50, y: 150 }}
            defaultSize={{ width: 800, height: 600 }}
            isCollapsed={collapsedWindows.search}
            onToggleCollapse={() => toggleWindow("search")}
          >
            <FileSearch />
          </FloatingWindow>
        )}

        {activeTab === "bookmarks" && (
          <FloatingWindow
            title="Bookmarks"
            icon={<Star className="w-5 h-5" />}
            defaultPosition={{ x: 50, y: 150 }}
            defaultSize={{ width: 800, height: 600 }}
            isCollapsed={collapsedWindows.bookmarks}
            onToggleCollapse={() => toggleWindow("bookmarks")}
          >
            <BookmarkedFiles />
          </FloatingWindow>
        )}

        {activeTab === "history" && (
          <FloatingWindow
            title="View History"
            icon={<History className="w-5 h-5" />}
            defaultPosition={{ x: 50, y: 150 }}
            defaultSize={{ width: 800, height: 600 }}
            isCollapsed={collapsedWindows.history}
            onToggleCollapse={() => toggleWindow("history")}
          >
            <ViewHistory />
          </FloatingWindow>
        )}

        {/* Collections Floating Window */}
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
