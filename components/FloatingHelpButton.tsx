"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { HelpModal } from "./HelpModal";

export function FloatingHelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 z-40 group"
        aria-label="Open help menu (press ? key)"
        title="Help (press ?)"
      >
        <HelpCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </button>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
