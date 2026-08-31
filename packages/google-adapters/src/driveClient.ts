// ==========================================================
// GCC Portal — Google Drive Client
// packages/google-adapters/src/driveClient.ts
// ==========================================================

import { getGoogleAccessToken, type ServiceAccountCredentials } from './googleAuth';

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
];

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export class DriveClient {
  constructor(private credentials: ServiceAccountCredentials) {}

  private async getToken(): Promise<string> {
    return getGoogleAccessToken(this.credentials, SCOPES);
  }

  /**
   * List files in a Drive folder.
   */
  async listFiles(folderId: string): Promise<DriveFile[]> {
    const token = await this.getToken();
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const fields = 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)';
    const url = `${DRIVE_BASE}/files?q=${query}&fields=${fields}`;

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(`Drive list error: ${resp.status}`);
    const data = (await resp.json()) as { files: DriveFile[] };
    return data.files;
  }

  /**
   * Download a file's content as an ArrayBuffer.
   * Used for proxying private files through the Worker.
   * NEVER expose the direct Drive share link to the client.
   */
  async downloadFile(fileId: string): Promise<{ content: ArrayBuffer; mimeType: string; name: string }> {
    const token = await this.getToken();

    // Get file metadata first
    const metaResp = await fetch(`${DRIVE_BASE}/files/${fileId}?fields=name,mimeType`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!metaResp.ok) throw new Error(`Drive metadata error: ${metaResp.status}`);
    const meta = (await metaResp.json()) as { name: string; mimeType: string };

    // Download content
    const contentResp = await fetch(`${DRIVE_BASE}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!contentResp.ok) throw new Error(`Drive download error: ${contentResp.status}`);
    const content = await contentResp.arrayBuffer();

    return { content, mimeType: meta.mimeType, name: meta.name };
  }

  /**
   * Upload a file to a specific Drive folder.
   * Returns the created file ID.
   */
  async uploadFile(
    folderId: string,
    name: string,
    mimeType: string,
    content: ArrayBuffer
  ): Promise<string> {
    const token = await this.getToken();

    const metadata = JSON.stringify({ name, parents: [folderId] });
    const boundary = '----GCCPortalBoundary';

    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      metadata,
      `--${boundary}`,
      `Content-Type: ${mimeType}`,
      '',
      '',
    ].join('\r\n');

    const metaBytes = new TextEncoder().encode(body);
    const endBoundary = new TextEncoder().encode(`\r\n--${boundary}--`);
    const combined = new Uint8Array(metaBytes.length + content.byteLength + endBoundary.length);
    combined.set(metaBytes, 0);
    combined.set(new Uint8Array(content), metaBytes.length);
    combined.set(endBoundary, metaBytes.length + content.byteLength);

    const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combined,
    });
    if (!resp.ok) throw new Error(`Drive upload error: ${resp.status} ${await resp.text()}`);
    const data = (await resp.json()) as { id: string };
    return data.id;
  }

  /**
   * Find a folder by name inside a parent folder, or create it if not found.
   */
  async findOrCreateFolder(parentFolderId: string, folderName: string): Promise<string> {
    const token = await this.getToken();

    const query = encodeURIComponent(
      `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const url = `${DRIVE_BASE}/files?q=${query}&fields=files(id)`;

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(`Drive search error: ${resp.status}`);
    const data = (await resp.json()) as { files: { id: string }[] };

    if (data.files && data.files.length > 0 && data.files[0]) {
      return data.files[0].id;
    }

    // Create folder
    const createResp = await fetch(`${DRIVE_BASE}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      }),
    });
    if (!createResp.ok) throw new Error(`Drive folder create error: ${createResp.status} ${await createResp.text()}`);
    const createdData = (await createResp.json()) as { id: string };
    return createdData.id;
  }
}
