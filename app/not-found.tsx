import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Page Not Found
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The
            page might have been moved or doesn&apos;t exist.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help? Try these quick links:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Settings
              </Link>
              <a
                href="/api/health"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
