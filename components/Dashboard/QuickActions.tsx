"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  Settings,
  RefreshCw,
  Download,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function QuickActions() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleRefresh = () => {
    showToast("Refreshing dashboard data...", "info");
    setTimeout(() => window.location.reload(), 500);
  };

  const exportAsJSON = async () => {
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/activities?limit=100"),
      ]);

      if (statsResponse.ok && activitiesResponse.ok) {
        const stats = await statsResponse.json();
        const activities = await activitiesResponse.json();

        const exportData = {
          exportDate: new Date().toISOString(),
          stats: stats.stats,
          activities: activities.activities,
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `dashboard-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Data exported as JSON successfully!", "success");
      } else {
        showToast("Failed to export data", "error");
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      showToast("Failed to export data. Please try again.", "error");
    }
  };

  const exportAsCSV = async () => {
    try {
      const response = await fetch("/api/activities?limit=100");
      if (response.ok) {
        const { activities } = await response.json();

        const csvHeaders = ["Date", "Time", "Type", "Message"];
        const csvRows = activities.map(
          (activity: {
            createdAt: string;
            type: string;
            message: string;
          }) => {
            const date = new Date(activity.createdAt);
            return [
              date.toLocaleDateString(),
              date.toLocaleTimeString(),
              activity.type,
              `"${activity.message.replace(/"/g, '""')}"`,
            ];
          }
        );

        const csvContent = [
          csvHeaders.join(","),
          ...csvRows.map((row: string[]) => row.join(",")),
        ].join("\n");

        const dataBlob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `activities-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Activities exported as CSV successfully!", "success");
      } else {
        showToast("Failed to export data", "error");
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      showToast("Failed to export data. Please try again.", "error");
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleGoogleAccount = () => {
    window.open(
      "https://myaccount.google.com",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const actions = [
    {
      id: "refresh",
      label: "Refresh Data",
      icon: <RefreshCw className="w-5 h-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
      onClick: handleRefresh,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
      onClick: handleSettings,
    },
    {
      id: "google",
      label: "Google Account",
      icon: <ExternalLink className="w-5 h-5" />,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
      onClick: handleGoogleAccount,
    },
  ];

  return (
    <Card>
      <CardHeader
        icon={
          <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        }
        title="Quick Actions"
        iconBgColor="bg-purple-100 dark:bg-purple-900"
      />
      <div className="space-y-2">
        {/* Regular Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-all ${action.bgColor} hover:scale-105 active:scale-95`}
            >
              <div className={action.color}>{action.icon}</div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Export Section */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 mb-2">
            <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Export Data
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportAsJSON}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-105 active:scale-95"
            >
              <FileJson className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                JSON
              </span>
            </button>
            <button
              onClick={exportAsCSV}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-105 active:scale-95"
            >
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                CSV
              </span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
