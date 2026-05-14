import { google } from 'googleapis';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  viewedByMeTime?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
  sharingUser?: { displayName: string; emailAddress: string };
  shared: boolean;
  webViewLink: string;
  iconLink?: string;
  size?: string;
  parents?: string[];
}

export interface DriveFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export class GoogleDriveClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: this.accessToken });
    return oauth2Client;
  }

  /**
   * Get files shared with me
   */
  async getSharedWithMe(pageSize = 20, pageToken?: string): Promise<DriveFilesResponse> {
    const drive = google.drive({ version: 'v3', auth: this.getOAuth2Client() });

    const response = await drive.files.list({
      q: 'sharedWithMe=true and trashed=false',
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, viewedByMeTime, owners, sharingUser, shared, webViewLink, iconLink, size, parents)',
      orderBy: 'viewedByMeTime desc',
    });

    return {
      files: (response.data.files || []) as DriveFile[],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  /**
   * Get recently viewed files
   */
  async getRecentlyViewed(pageSize = 20, pageToken?: string): Promise<DriveFilesResponse> {
    const drive = google.drive({ version: 'v3', auth: this.getOAuth2Client() });

    const response = await drive.files.list({
      q: 'trashed=false',
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, viewedByMeTime, owners, sharingUser, shared, webViewLink, iconLink, size, parents)',
      orderBy: 'viewedByMeTime desc',
    });

    return {
      files: (response.data.files || []) as DriveFile[],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  /**
   * Get my files by type
   */
  async getMyFiles(mimeType?: string, pageSize = 20, pageToken?: string): Promise<DriveFilesResponse> {
    const drive = google.drive({ version: 'v3', auth: this.getOAuth2Client() });

    let query = "'me' in owners and trashed=false";
    if (mimeType) {
      query += ` and mimeType='${mimeType}'`;
    }

    const response = await drive.files.list({
      q: query,
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, viewedByMeTime, owners, sharingUser, shared, webViewLink, iconLink, size, parents)',
      orderBy: 'modifiedTime desc',
    });

    return {
      files: (response.data.files || []) as DriveFile[],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  /**
   * Search files
   */
  async searchFiles(query: string, pageSize = 20, pageToken?: string): Promise<DriveFilesResponse> {
    const drive = google.drive({ version: 'v3', auth: this.getOAuth2Client() });

    const searchQuery = `trashed=false and (name contains '${query}' or fullText contains '${query}')`;

    const response = await drive.files.list({
      q: searchQuery,
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, viewedByMeTime, owners, sharingUser, shared, webViewLink, iconLink, size, parents)',
      orderBy: 'modifiedTime desc',
    });

    return {
      files: (response.data.files || []) as DriveFile[],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  /**
   * Get file type label
   */
  static getFileTypeLabel(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'application/vnd.google-apps.document': 'Doc',
      'application/vnd.google-apps.spreadsheet': 'Sheet',
      'application/vnd.google-apps.presentation': 'Slides',
      'application/vnd.google-apps.folder': 'Folder',
      'application/vnd.google-apps.shortcut': 'Shortcut',
      'application/pdf': 'PDF',
      'image/': 'Image',
      'video/': 'Video',
    };

    for (const [key, label] of Object.entries(typeMap)) {
      if (mimeType.startsWith(key)) {
        return label;
      }
    }

    return 'Other';
  }
}
