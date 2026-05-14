"use client";

import { useState, useEffect } from "react";
import { CollectionsManager } from "@/lib/collections";
import { SmartCollection, CollectionProfile } from "@/lib/types/intelligence";
import { DriveFile } from "@/lib/google-drive";
import { Plus, FolderOpen, Trash2, Edit2, ChevronRight, ChevronDown } from "lucide-react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";

interface CollectionsSidebarProps {
  allFiles: DriveFile[];
  onFileRemove?: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export function CollectionsSidebar({ allFiles, onFileRemove, isVisible, onClose }: CollectionsSidebarProps) {
  const [collections, setCollections] = useState<SmartCollection[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<SmartCollection | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<SmartCollection | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [defaultPosition, setDefaultPosition] = useState({ x: 100, y: 100 });

  useEffect(() => {
    loadCollections();
    if (typeof window !== 'undefined') {
      setDefaultPosition({ x: window.innerWidth - 450, y: 100 });
    }
  }, []);

  const loadCollections = () => {
    const cols = CollectionsManager.getAllCollections();
    setCollections(cols);
  };

  const handleCreateCollection = (name: string, theme: CollectionProfile['theme']) => {
    CollectionsManager.createCollection(name, theme);
    loadCollections();
    setShowCreateModal(false);
  };

  const handleDeleteCollection = (collectionId: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      CollectionsManager.deleteCollection(collectionId);
      loadCollections();
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("fileId");
    if (fileId) {
      CollectionsManager.addFileToCollection(collectionId, fileId);
      loadCollections();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleRemoveFile = (collectionId: string, fileId: string) => {
    CollectionsManager.removeFileFromCollection(collectionId, fileId);
    loadCollections();
    if (onFileRemove) onFileRemove();
  };

  const toggleExpanded = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const getFilesForCollection = (collection: SmartCollection): DriveFile[] => {
    return allFiles.filter(file => collection.fileIds.includes(file.id));
  };

  const themeColors = {
    blue: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
    purple: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
    green: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
    red: "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700",
    orange: "bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700",
    gray: "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
  };

  if (!isVisible) return null;

  return (
    <>
      <FloatingWindow
        title="Virtual Buckets"
        icon={<FolderOpen className="w-5 h-5" />}
        defaultPosition={defaultPosition}
        defaultSize={{ width: 380, height: 600 }}
        onClose={onClose}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      >
        {/* Header Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Drag files here to organize
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              title="New Bucket"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        {/* Collections List */}
        <div className="p-3 space-y-2">
          {collections.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-2">No buckets yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                Create your first bucket
              </button>
            </div>
          ) : (
            collections.map((collection) => {
              const files = getFilesForCollection(collection);
              const themeClass = themeColors[collection.profile?.theme || 'gray'] || themeColors.gray;
              const isExpanded = expandedCollections.has(collection.id);

              return (
                <div key={collection.id} className="space-y-1">
                  {/* Bucket Header */}
                  <div
                    onDrop={(e) => handleDrop(e, collection.id)}
                    onDragOver={handleDragOver}
                    className={`border-2 border-dashed rounded-lg p-2 transition-all hover:shadow-sm ${themeClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(collection.id)}
                        className="flex-shrink-0 p-0.5 hover:bg-white/50 dark:hover:bg-black/20 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <FolderOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                        {collection.name}
                      </span>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCollection(collection);
                            setShowCreateModal(true);
                          }}
                          className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded"
                          title="Edit bucket"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id);
                          }}
                          className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded text-red-600"
                          title="Delete bucket"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 ml-6">
                      {files.length} {files.length === 1 ? 'file' : 'files'}
                    </p>
                  </div>

                  {/* Expanded File List */}
                  {isExpanded && files.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 truncate text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {file.name}
                          </a>
                          <button
                            onClick={() => handleRemoveFile(collection.id, file.id)}
                            className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                            title="Remove from bucket"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </FloatingWindow>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateCollectionModal
          existingCollection={editingCollection}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCollection(null);
          }}
          onCreate={handleCreateCollection}
          onUpdate={(id, name, theme) => {
            CollectionsManager.updateCollection(id, { name, profile: { theme } });
            loadCollections();
            setShowCreateModal(false);
            setEditingCollection(null);
          }}
        />
      )}
    </>
  );
}

// Create Collection Modal Component (reused from original)
function CreateCollectionModal({
  existingCollection,
  onClose,
  onCreate,
  onUpdate,
}: {
  existingCollection: SmartCollection | null;
  onClose: () => void;
  onCreate: (name: string, theme: CollectionProfile['theme']) => void;
  onUpdate: (id: string, name: string, theme: CollectionProfile['theme']) => void;
}) {
  const [name, setName] = useState(existingCollection?.name || "");
  const [theme, setTheme] = useState<CollectionProfile['theme']>(
    existingCollection?.profile?.theme || "purple"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (existingCollection) {
        onUpdate(existingCollection.id, name.trim(), theme);
      } else {
        onCreate(name.trim(), theme);
      }
    }
  };

  const themes: Array<{ value: CollectionProfile['theme']; label: string; color: string }> = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {existingCollection ? 'Edit Bucket' : 'Create New Bucket'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bucket Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work Documents, Personal Photos"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-6 gap-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={`relative w-10 h-10 rounded-lg ${t.color} ${
                    theme === t.value ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : ''
                  }`}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors"
            >
              {existingCollection ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
