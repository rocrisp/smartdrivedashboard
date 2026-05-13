"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Activity, CheckCircle, LogIn, UserPlus, Settings } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities?limit=5");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "signup":
        return <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case "update":
        return <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "settings":
        return <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        icon={<Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
        title="Recent Activity"
        iconBgColor="bg-indigo-100 dark:bg-indigo-900"
      />
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatTimestamp(activity.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
