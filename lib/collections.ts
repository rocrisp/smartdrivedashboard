import { IntelligenceStorage } from './storage/intelligence-storage';
import { SmartCollection, CollectionProfile } from './types/intelligence';

/**
 * Collections Manager - Handle virtual buckets/folders for organizing files
 * Files are stored as references (IDs), not duplicated
 * Collections are stored locally and not synced to Google Drive
 */
export class CollectionsManager {
  /**
   * Get all collections
   */
  static getAllCollections(): SmartCollection[] {
    const storage = new IntelligenceStorage();
    const data = storage.getCollections();
    return data?.collections || [];
  }

  /**
   * Get collection by ID
   */
  static getCollection(collectionId: string): SmartCollection | null {
    const collections = this.getAllCollections();
    return collections.find(c => c.id === collectionId) || null;
  }

  /**
   * Create new collection
   */
  static createCollection(
    name: string,
    theme: CollectionProfile['theme'] = 'purple'
  ): SmartCollection {
    const profile: CollectionProfile = {
      theme,
      isCollapsed: false,
    };

    const newCollection: SmartCollection = {
      id: this.generateId(),
      name,
      fileIds: [],
      suggestedFileIds: [],
      isBookmarked: false,
      profile,
      createdAt: new Date().toISOString(),
    };

    IntelligenceStorage.addCollection(newCollection);
    return newCollection;
  }

  /**
   * Update collection name and profile
   */
  static updateCollection(
    collectionId: string,
    updates: { name?: string; profile?: Partial<CollectionProfile> }
  ): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    const updatedCollection: Partial<SmartCollection> = {};

    if (updates.name !== undefined) {
      updatedCollection.name = updates.name;
    }

    if (updates.profile && collection.profile) {
      updatedCollection.profile = {
        ...collection.profile,
        ...updates.profile,
      };
    }

    IntelligenceStorage.updateCollection(collectionId, updatedCollection);
    return true;
  }

  /**
   * Delete collection
   */
  static deleteCollection(collectionId: string): boolean {
    IntelligenceStorage.deleteCollection(collectionId);
    return true;
  }

  /**
   * Add file to collection
   */
  static addFileToCollection(collectionId: string, fileId: string): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    // Don't add duplicates
    if (collection.fileIds.includes(fileId)) return false;

    const updatedFileIds = [...collection.fileIds, fileId];
    IntelligenceStorage.updateCollection(collectionId, {
      fileIds: updatedFileIds,
    });

    return true;
  }

  /**
   * Add multiple files to collection
   */
  static addFilesToCollection(collectionId: string, fileIds: string[]): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    // Filter out duplicates
    const newFileIds = fileIds.filter(id => !collection.fileIds.includes(id));
    if (newFileIds.length === 0) return false;

    const updatedFileIds = [...collection.fileIds, ...newFileIds];
    IntelligenceStorage.updateCollection(collectionId, {
      fileIds: updatedFileIds,
    });

    return true;
  }

  /**
   * Remove file from collection
   */
  static removeFileFromCollection(collectionId: string, fileId: string): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    const updatedFileIds = collection.fileIds.filter(id => id !== fileId);
    IntelligenceStorage.updateCollection(collectionId, {
      fileIds: updatedFileIds,
    });

    return true;
  }

  /**
   * Get files in collection
   */
  static getCollectionFileIds(collectionId: string): string[] {
    const collection = this.getCollection(collectionId);
    return collection?.fileIds || [];
  }

  /**
   * Check if file is in collection
   */
  static isFileInCollection(collectionId: string, fileId: string): boolean {
    const collection = this.getCollection(collectionId);
    return collection?.fileIds.includes(fileId) || false;
  }

  /**
   * Get collections containing a file
   */
  static getCollectionsForFile(fileId: string): SmartCollection[] {
    const allCollections = this.getAllCollections();
    return allCollections.filter(c => c.fileIds.includes(fileId));
  }

  /**
   * Generate unique collection ID
   */
  private static generateId(): string {
    return `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
