"use client";

import { X, Keyboard, HelpCircle, Zap } from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const shortcuts = [
    { key: "?", description: "Show/hide this help modal" },
    { key: "d", description: "Go to Dashboard" },
    { key: "s", description: "Go to Settings" },
    { key: "e", description: "Go to Sessions" },
    { key: "/", description: "Focus search (when available)" },
    { key: "r", description: "Refresh current page" },
    { key: "Esc", description: "Close modal/dialog" },
  ];

  const features = [
    {
      icon: <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: "Activity Tracking",
      description: "All your actions are automatically logged and visualized",
    },
    {
      icon: <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />,
      title: "Quick Export",
      description: "Export your data as JSON or CSV with one click",
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: "Session Control",
      description: "Manage active sessions and revoke access from any device",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close help modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Help & Shortcuts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick reference guide
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <kbd className="px-3 py-1.5 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Tips
            </h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Getting Started */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Getting Started
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  1.
                </span>
                <span>
                  Your dashboard shows real-time statistics and recent activity
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  2.
                </span>
                <span>
                  Use the search bar in Activities to filter by type or message
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  3.
                </span>
                <span>
                  Customize your experience in Settings (theme, notifications,
                  etc.)
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  4.
                </span>
                <span>
                  Check Sessions regularly to monitor active logins across
                  devices
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  5.
                </span>
                <span>
                  Export your data anytime as JSON (complete) or CSV
                  (activities)
                </span>
              </p>
            </div>
          </div>

          {/* Need More Help */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Need More Help?
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              This is a proof-of-concept application. For questions or issues,
              please refer to the README documentation or contact your
              administrator.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
