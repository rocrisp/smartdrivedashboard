"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { TrendingUp, Activity, Users, Calendar } from "lucide-react";
import { SkeletonStat } from "@/components/ui/Skeleton";

interface Stats {
  totalSignins: number;
  activeSessions: number;
  accountAgeDays: number;
  totalActivities: number;
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAccountAge = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Total Sign-ins",
      value: stats.totalSignins.toString(),
      icon: <Activity className="w-5 h-5" />,
      color: "bg-blue-500",
    },
    {
      label: "Active Sessions",
      value: stats.activeSessions.toString(),
      icon: <Users className="w-5 h-5" />,
      color: "bg-green-500",
    },
    {
      label: "Account Age",
      value: formatAccountAge(stats.accountAgeDays),
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-purple-500",
    },
    {
      label: "Total Activities",
      value: stats.totalActivities.toString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index} hover className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div
              className={`p-2 ${stat.color} bg-opacity-10 dark:bg-opacity-20 rounded-lg`}
            >
              <div className={`${stat.color.replace("bg-", "text-")}`}>
                {stat.icon}
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stat.value}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stat.label}
          </p>
        </Card>
      ))}
    </div>
  );
}
