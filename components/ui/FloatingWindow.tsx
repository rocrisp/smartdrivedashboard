"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { X, Minus, Maximize2, Minimize2 } from "lucide-react";

interface FloatingWindowProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

export function FloatingWindow({
  title,
  icon,
  children,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 600 },
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  className = "",
  onPositionChange,
  onSizeChange,
}: FloatingWindowProps) {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
        if (onPositionChange) {
          onPositionChange(newPosition);
        }
      }
      if (isResizing) {
        const newWidth = Math.max(300, e.clientX - defaultPosition.x);
        const newHeight = Math.max(200, e.clientY - defaultPosition.y);
        const newSize = { width: newWidth, height: newHeight };
        if (onSizeChange) {
          onSizeChange(newSize);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, defaultPosition, onPositionChange, onSizeChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  if (!mounted) return null;

  return (
    <div
      ref={windowRef}
      className={`fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl z-50 ${className}`}
      style={{
        left: `${defaultPosition.x}px`,
        top: `${defaultPosition.y}px`,
        width: isCollapsed ? "auto" : `${defaultSize.width}px`,
        height: isCollapsed ? "auto" : `${defaultSize.height}px`,
      }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-white">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? (
                <Maximize2 className="w-4 h-4 text-white" />
              ) : (
                <Minus className="w-4 h-4 text-white" />
              )}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <>
          <div className="overflow-auto" style={{ height: `calc(${defaultSize.height}px - 56px)` }}>
            {children}
          </div>

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          >
            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-400 dark:border-gray-500" />
          </div>
        </>
      )}
    </div>
  );
}
