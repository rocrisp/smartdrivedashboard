"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Mail, Calendar, Shield, CheckCircle } from "lucide-react";

export function UserProfileCard() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <Card className="animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {session.user.image ? (
            <div className="relative">
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={120}
                height={120}
                className="rounded-xl ring-4 ring-blue-500 ring-offset-2"
                priority
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-4xl font-bold ring-4 ring-blue-500 ring-offset-2">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {session.user.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Google Account
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Email Address
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.user.email}
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Account Status
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Active & Verified
                  </p>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Member Since
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  User ID
                </p>
                <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
                  {session.user.id.substring(0, 16)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
