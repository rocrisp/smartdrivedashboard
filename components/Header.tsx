"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, Settings as SettingsIcon, LayoutDashboard, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              aria-label="Go to dashboard home"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center" aria-hidden="true">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white hidden sm:block">
                SmartDrive Dashboard
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2 ml-4" aria-label="Main navigation">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-current={pathname === "/dashboard" ? "page" : undefined}
              >
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                href="/settings"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/settings"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-current={pathname === "/settings" ? "page" : undefined}
              >
                <SettingsIcon className="w-4 h-4" aria-hidden="true" />
                Settings
              </Link>
              <Link
                href="/sessions"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/sessions"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-current={pathname === "/sessions" ? "page" : undefined}
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                Sessions
              </Link>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile navigation */}
            <Link
              href="/settings"
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Sign out of your account"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
