import { Card, CardHeader } from "@/components/ui/Card";
import { Activity, CheckCircle, LogIn, UserPlus } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "login" | "signup" | "update";
  message: string;
  timestamp: Date;
}

export function ActivityFeed() {
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "login",
      message: "Successfully signed in with Google",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "signup",
      message: "Account created and verified",
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: "3",
      type: "update",
      message: "Profile information synchronized",
      timestamp: new Date(Date.now() - 120000),
    },
  ];

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "login":
        return <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "signup":
        return <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case "update":
        return <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        icon={<Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
        title="Recent Activity"
        iconBgColor="bg-indigo-100 dark:bg-indigo-900"
      />
      <div className="space-y-3">
        {activities.map((activity) => (
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
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
