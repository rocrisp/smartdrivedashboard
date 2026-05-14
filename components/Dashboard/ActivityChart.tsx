"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";

interface DailyActivity {
  date: string;
  count: number;
}

export function ActivityChart() {
  const [data, setData] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchActivityData = async () => {
    try {
      const response = await fetch("/api/activities?limit=100");
      if (response.ok) {
        const { activities } = await response.json();

        const dailyData = processDailyData(activities);
        setData(dailyData);
      }
    } catch (error) {
      console.error("Failed to fetch activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processDailyData = (
    activities: Array<{ createdAt: string }>
  ): DailyActivity[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const countsByDate = activities.reduce((acc, activity) => {
      const date = new Date(activity.createdAt).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return last7Days.map((date) => ({
      date,
      count: countsByDate[date] || 0,
    }));
  };

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Trend
          </h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
          <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Trend
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last 7 days
          </p>
        </div>
      </div>

      {data.every((d) => d.count === 0) ? (
        <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
          No activity data available
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((day, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium w-12">
                  {formatDate(day.date)}
                </span>
                <div className="flex-1 mx-3">
                  <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${(day.count / maxCount) * 100}%`,
                        minWidth: day.count > 0 ? "2rem" : "0",
                      }}
                    >
                      {day.count > 0 && (
                        <span className="text-xs font-bold text-white">
                          {day.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Total this week
          </div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {data.reduce((sum, day) => sum + day.count, 0)} activities
          </div>
        </div>
      </div>
    </Card>
  );
}
