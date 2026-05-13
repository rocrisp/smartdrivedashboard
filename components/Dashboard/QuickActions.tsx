"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Settings, RefreshCw, Download, ExternalLink } from "lucide-react";

export function QuickActions() {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = async () => {
    try {
      // Fetch user data
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();

        // Create downloadable JSON
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        // Download file
        const link = document.createElement("a");
        link.href = url;
        link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleGoogleAccount = () => {
    window.open("https://myaccount.google.com", "_blank", "noopener,noreferrer");
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
      id: "export",
      label: "Export Data",
      icon: <Download className="w-5 h-5" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
      onClick: handleExport,
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
        icon={<Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
        title="Quick Actions"
        iconBgColor="bg-purple-100 dark:bg-purple-900"
      />
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
    </Card>
  );
}
