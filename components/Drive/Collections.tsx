"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CollectionsManager } from "@/lib/collections";
import { SmartCollection, CollectionProfile } from "@/lib/types/intelligence";
import { DriveFile } from "@/lib/google-drive";
import { Plus, FolderOpen, Trash2, Edit2, FileText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";

export function Collections() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<SmartCollection[]>([]);
  const [allFiles, setAllFiles] = useState<DriveFile[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<SmartCollection | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<SmartCollection | null>(null);

  useEffect(() => {
    loadCollections();
    loadAllFiles();
  }, []);

  const loadCollections = () => {
    const cols = CollectionsManager.getAllCollections();
    setCollections(cols);
  };

  const loadAllFiles = async () => {
    if (!session) return;

    try {
      const response = await fetch("/api/drive/recently-viewed?pageSize=100");
      if (response.ok) {
        const data = await response.json();
        setAllFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    }
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
  };

  const handleRemoveFile = (collectionId: string, fileId: string) => {
    CollectionsManager.removeFileFromCollection(collectionId, fileId);
    loadCollections();
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

  return (
    <Card>
      <CardHeader
        icon={<FolderOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
        title="Virtual Buckets"
        iconBgColor="bg-purple-100 dark:bg-purple-900"
      >
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Bucket
        </button>
      </CardHeader>

      <div className="mt-4">
        {collections.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No buckets yet</p>
            <p className="text-sm mb-4">Create virtual buckets to organize your files</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Bucket
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => {
              const files = getFilesForCollection(collection);
              const themeClass = themeColors[collection.profile?.theme || 'gray'] || themeColors.gray;

              return (
                <div
                  key={collection.id}
                  onDrop={(e) => handleDrop(e, collection.id)}
                  onDragOver={handleDragOver}
                  className={`relative border-2 border-dashed rounded-xl p-4 transition-all hover:shadow-md cursor-pointer ${themeClass}`}
                  onClick={() => setSelectedCollection(collection)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {collection.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCollection(collection);
                          setShowCreateModal(true);
                        }}
                        className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(collection.id);
                        }}
                        className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {files.length} {files.length === 1 ? 'file' : 'files'}
                    </p>
                    {files.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Drop more files here or click to view
                      </div>
                    )}
                    {files.length === 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Drag and drop files here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Collection Detail Modal */}
      {selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          files={getFilesForCollection(selectedCollection)}
          onClose={() => setSelectedCollection(null)}
          onRemoveFile={handleRemoveFile}
        />
      )}
    </Card>
  );
}

// Create Collection Modal Component
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

// Collection Detail Modal Component
function CollectionDetailModal({
  collection,
  files,
  onClose,
  onRemoveFile,
}: {
  collection: SmartCollection;
  files: DriveFile[];
  onClose: () => void;
  onRemoveFile: (collectionId: string, fileId: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {collection.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No files in this bucket yet</p>
              <p className="text-sm mt-1">Drag and drop files from other tabs</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {file.name}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveFile(collection.id, file.id)}
                    className="ml-2 p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
