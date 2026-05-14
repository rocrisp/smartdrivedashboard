"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SharedWithMe } from "@/components/Drive/SharedWithMe";
import { RecentlyViewed } from "@/components/Drive/RecentlyViewed";
import { FileSearch } from "@/components/Drive/FileSearch";
import { BookmarkedFiles } from "@/components/Drive/BookmarkedFiles";
import { ViewHistory } from "@/components/Drive/ViewHistory";
import { UserProfileCard } from "@/components/Dashboard/UserProfileCard";
import { FloatingHelpButton } from "@/components/FloatingHelpButton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Clock, Users, Search, Star, History } from "lucide-react";
import { IntelligenceManager } from "@/lib/intelligence/intelligence-manager";

type Tab = "recent" | "shared" | "search" | "bookmarks" | "history";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("recent");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Initialize intelligence system
  useEffect(() => {
    IntelligenceManager.initialize();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* User Profile */}
        <div className="mb-6">
          <UserProfileCard />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {activeTab === "recent" && <RecentlyViewed />}
          {activeTab === "shared" && <SharedWithMe />}
          {activeTab === "search" && <FileSearch />}
          {activeTab === "bookmarks" && <BookmarkedFiles />}
          {activeTab === "history" && <ViewHistory />}
        </div>
      </main>

      <Footer />
      <FloatingHelpButton />
    </div>
  );
}
