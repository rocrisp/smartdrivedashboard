"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  TrendingUp,
  Database,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ActivityFeed } from "@/components/Dashboard/ActivityFeed";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { StatsOverview } from "@/components/Dashboard/StatsOverview";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Welcome Section */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={64}
                height={64}
                className="rounded-full ring-2 ring-blue-500"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {session.user?.name?.split(" ")[0]}!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Here&apos;s your personal dashboard overview
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                All systems operational
              </span>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="mb-6">
          <StatsOverview />
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Profile Card */}
          <Card hover>
            <CardHeader
              icon={<User className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              title="Profile"
              iconBgColor="bg-blue-100 dark:bg-blue-900"
            />
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                <span className="font-medium">Name:</span> {session.user?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                <span className="font-medium">ID:</span> {session.user?.id.substring(0, 12)}...
              </p>
            </div>
          </Card>

          {/* Email Card */}
          <Card hover>
            <CardHeader
              icon={<Mail className="w-6 h-6 text-green-600 dark:text-green-400" />}
              title="Email"
              iconBgColor="bg-green-100 dark:bg-green-900"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {session.user?.email}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Verified
              </span>
            </div>
          </Card>

          {/* Security Card */}
          <Card hover>
            <CardHeader
              icon={<Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
              title="Security"
              iconBgColor="bg-purple-100 dark:bg-purple-900"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Google OAuth 2.0
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Secure Connection
              </span>
            </div>
          </Card>

          {/* Status Card */}
          <Card hover>
            <CardHeader
              icon={<TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
              title="Status"
              iconBgColor="bg-orange-100 dark:bg-orange-900"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Dashboard Active
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Synced
              </span>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Session Started
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Last Sign In
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <Database className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Data Storage
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  PostgreSQL
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ActivityFeed />
          <QuickActions />
        </div>

      </main>
      <Footer />
    </div>
  );
}
