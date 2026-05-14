"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Shield,
  Palette,
  LogOut,
  Trash2,
  Save,
  Globe,
  Clock,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingHelpButton } from "@/components/FloatingHelpButton";
import { useToast } from "@/components/ui/Toast";
import { UserProfileCard } from "@/components/Dashboard/UserProfileCard";

interface UserPreferences {
  emailNotifications: boolean;
  activityEmailDigest: boolean;
  showRecentActivity: boolean;
  theme: string;
  language: string;
  timezone: string;
}

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      showToast("Failed to load preferences", "error");
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (
    key: keyof UserPreferences,
    value: string | boolean
  ) => {
    if (preferences) {
      setPreferences({ ...preferences, [key]: value });
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        showToast("Preferences saved successfully", "success");
      } else {
        showToast("Failed to save preferences", "error");
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      showToast("Failed to save preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
      });

      if (response.ok) {
        showToast(
          "Account deleted successfully. Redirecting...",
          "success"
        );
        setTimeout(() => {
          signOut({ callbackUrl: "/" });
        }, 1500);
      } else {
        showToast("Failed to delete account", "error");
        setDeleting(false);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      showToast("Failed to delete account. Please try again.", "error");
      setDeleting(false);
    }
  };

  if (status === "loading" || !session || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* Main Content */}
      <main
        id="main-content"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
      >
        {/* Profile Section */}
        <div className="mb-6">
          <UserProfileCard />
        </div>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader
            icon={
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            }
            title="Appearance"
            iconBgColor="bg-purple-100 dark:bg-purple-900"
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Theme Preference
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose your preferred color scheme
                </p>
              </div>
              <select
                value={preferences?.theme || "system"}
                onChange={(e) => updatePreference("theme", e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Language
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Display language preference
                  </p>
                </div>
              </div>
              <select
                value={preferences?.language || "en"}
                onChange={(e) => updatePreference("language", e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                  <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Timezone
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your local timezone
                  </p>
                </div>
              </div>
              <select
                value={preferences?.timezone || "UTC"}
                onChange={(e) => updatePreference("timezone", e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
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
                  Receive important updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.emailNotifications ?? true}
                  onChange={(e) =>
                    updatePreference("emailNotifications", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Activity Email Digest
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Weekly summary of your activity
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.activityEmailDigest ?? false}
                  onChange={(e) =>
                    updatePreference("activityEmailDigest", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Show Recent Activity
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Display activity feed on dashboard
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.showRecentActivity ?? true}
                  onChange={(e) =>
                    updatePreference("showRecentActivity", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <button
          onClick={savePreferences}
          disabled={saving}
          className="w-full mb-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Preferences"}
        </button>

        {/* Security */}
        <Card className="mb-6">
          <CardHeader
            icon={
              <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            }
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
              account and remove all associated data including activities,
              sessions, and preferences.
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Account?
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you absolutely sure you want to delete your account? This
                action cannot be undone and will permanently remove:
              </p>

              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-1">
                <li>Your profile and account information</li>
                <li>All activity history and logs</li>
                <li>User preferences and settings</li>
                <li>All active sessions</li>
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
                >
                  {deleting ? "Deleting..." : "Delete Forever"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <FloatingHelpButton />
    </div>
  );
}
