"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import {
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  Trash2,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader
            icon={<User className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            title="Profile Information"
            iconBgColor="bg-blue-100 dark:bg-blue-900"
          />
          <div className="flex items-center gap-4 mb-6">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={80}
                height={80}
                className="rounded-full ring-2 ring-blue-500"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.user?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {session.user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Account ID: {session.user?.id}
              </p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Profile information is synced from your
              Google account and cannot be edited here.
            </p>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <CardHeader
            icon={<Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
            title="Appearance"
            iconBgColor="bg-purple-100 dark:bg-purple-900"
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Theme
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose your preferred color scheme
                </p>
              </div>
              <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader
            icon={<Bell className="w-6 h-6 text-green-600 dark:text-green-400" />}
            title="Notifications"
            iconBgColor="bg-green-100 dark:bg-green-900"
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Receive updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="mb-6">
          <CardHeader
            icon={<Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
            title="Security"
            iconBgColor="bg-orange-100 dark:bg-orange-900"
          />
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Authentication Provider
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                You&apos;re signed in with Google OAuth 2.0
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Secure Connection
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-200 dark:border-red-900">
          <CardHeader
            icon={<Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />}
            title="Danger Zone"
            iconBgColor="bg-red-100 dark:bg-red-900"
          />
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium text-red-900 dark:text-red-300 mb-2">
              Delete Account
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4">
              This action cannot be undone. This will permanently delete your
              account and remove all associated data.
            </p>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
