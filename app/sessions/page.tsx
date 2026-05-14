"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Monitor,
  Smartphone,
  Shield,
  Trash2,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingHelpButton } from "@/components/FloatingHelpButton";
import { useToast } from "@/components/ui/Toast";

interface SessionItem {
  id: string;
  isCurrent: boolean;
  expires: string;
  createdAt: string;
}

export default function Sessions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      } else {
        showToast("Failed to load sessions", "error");
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      showToast("Failed to load sessions", "error");
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (revoking) return;

    const sessionToRevoke = sessions.find((s) => s.id === sessionId);
    if (sessionToRevoke?.isCurrent) {
      showToast(
        "Cannot revoke current session. Sign out instead.",
        "warning"
      );
      return;
    }

    setRevoking(sessionId);
    try {
      const response = await fetch(`/api/sessions?id=${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Session revoked successfully", "success");
        fetchSessions();
      } else {
        showToast("Failed to revoke session", "error");
      }
    } catch (error) {
      console.error("Failed to revoke session:", error);
      showToast("Failed to revoke session", "error");
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilExpiry = (expiresStr: string) => {
    const expires = new Date(expiresStr);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Soon";
  };

  if (status === "loading" || !session || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main
        id="main-content"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
      >
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Active Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your active login sessions and enhance your account security
          </p>
        </div>

        {/* Security Info */}
        <Card className="mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Session Security
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Each session represents an active login to your account. If you
                see an unfamiliar session, revoke it immediately and consider
                changing your password.
              </p>
              <button
                onClick={fetchSessions}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Sessions
              </button>
            </div>
          </div>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader
            icon={<Monitor className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
            title={`Active Sessions (${sessions.length})`}
            iconBgColor="bg-purple-100 dark:bg-purple-900"
          />

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active sessions found</p>
              </div>
            ) : (
              sessions.map((sessionItem) => (
                <div
                  key={sessionItem.id}
                  className={`p-4 rounded-lg border-2 ${
                    sessionItem.isCurrent
                      ? "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          sessionItem.isCurrent
                            ? "bg-green-100 dark:bg-green-900"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <Smartphone
                          className={`w-5 h-5 ${
                            sessionItem.isCurrent
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {sessionItem.isCurrent
                              ? "Current Session"
                              : "Browser Session"}
                          </h4>
                          {sessionItem.isCurrent && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Expires: {formatDate(sessionItem.expires)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            Time remaining:{" "}
                            {getTimeUntilExpiry(sessionItem.expires)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!sessionItem.isCurrent && (
                      <button
                        onClick={() => revokeSession(sessionItem.id)}
                        disabled={revoking === sessionItem.id}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {revoking === sessionItem.id ? "Revoking..." : "Revoke"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            About Sessions
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>
              • Sessions are created each time you sign in to your account
            </p>
            <p>
              • Sessions automatically expire after a period of inactivity for
              security
            </p>
            <p>
              • Revoking a session will sign out that device immediately
            </p>
            <p>
              • You cannot revoke your current session - use the Sign Out button
              instead
            </p>
          </div>
        </Card>
      </main>
      <Footer />
      <FloatingHelpButton />
    </div>
  );
}
