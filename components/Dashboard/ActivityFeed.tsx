"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  Activity,
  CheckCircle,
  LogIn,
  UserPlus,
  Settings,
  Search,
  Filter,
  X,
} from "lucide-react";
import { SkeletonActivity } from "@/components/ui/Skeleton";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, searchQuery, typeFilter]);

  const fetchActivities = async () => {
    try {
      const limit = showAll ? 100 : 20;
      const response = await fetch(`/api/activities?limit=${limit}`);
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

  const filterActivities = () => {
    let filtered = [...activities];

    if (typeFilter !== "all") {
      filtered = filtered.filter((activity) => activity.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((activity) =>
        activity.message.toLowerCase().includes(query)
      );
    }

    setFilteredActivities(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchQuery !== "" || typeFilter !== "all";

  const getIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "signup":
        return (
          <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      case "update":
        return (
          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        );
      case "settings":
        return (
          <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        );
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

  const uniqueTypes = Array.from(new Set(activities.map((a) => a.type)));

  const displayedActivities = showAll
    ? filteredActivities
    : filteredActivities.slice(0, 5);

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        icon={
          <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        }
        title="Recent Activity"
        iconBgColor="bg-indigo-100 dark:bg-indigo-900"
      />

      {/* Search and Filter Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Status */}
        {hasActiveFilters && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {filteredActivities.length} of {activities.length}{" "}
            activities
          </div>
        )}
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <SkeletonActivity key={i} />
            ))}
          </>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {hasActiveFilters
                ? "No activities match your filters"
                : "No recent activity"}
            </p>
          </div>
        ) : (
          <>
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(activity.createdAt)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Show All Toggle */}
            {filteredActivities.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                {showAll
                  ? "Show Less"
                  : `Show All (${filteredActivities.length})`}
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
