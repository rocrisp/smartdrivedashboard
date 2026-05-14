import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : true;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : true;
        const metaMatch = shortcut.metaKey ? event.metaKey : true;

        if (keyMatch && ctrlMatch && shiftMatch && metaMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, enabled, router]);
}

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: "?",
    action: () => {},
    description: "Show keyboard shortcuts",
  },
  {
    key: "d",
    action: () => {},
    description: "Go to Dashboard",
  },
  {
    key: "s",
    action: () => {},
    description: "Go to Settings",
  },
  {
    key: "e",
    action: () => {},
    description: "Go to Sessions",
  },
  {
    key: "/",
    action: () => {},
    description: "Focus search (if available)",
  },
  {
    key: "r",
    action: () => {},
    description: "Refresh page",
  },
];
