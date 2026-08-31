// ==========================================================
// GCC Portal — File Upload & Google Drive Proxy Router
// apps/api/src/routes/files.ts
// ==========================================================

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Env } from '../types/env';
import type { AuthVariables } from '../middleware/auth';
import { DriveClient } from '@gcc-portal/google-adapters';
import { auditLog } from '../services/auditService';

type Variables = AuthVariables;

export const filesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

filesRouter.use('*', requireAuth);

// ----------------------------------------------------------
// 1. GET /api/v1/files/list — List department files
// ----------------------------------------------------------
filesRouter.get('/list', async (c) => {
  const user = c.get('user');
  const departmentId = c.req.query('departmentId');

  if (!departmentId) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing departmentId' } }, 400);
  }

  // Permission Check: Super Admins and Executive Council can view any department folder.
  // Regular members can only view their own department.
  const isPrivileged = user.roles.includes('SYSTEM_SUPER_ADMIN') || user.roles.includes('EXECUTIVE_COUNCIL');
  const isMember = user.departments.includes(departmentId as any);

  if (!isPrivileged && !isMember) {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied to department files' } }, 403);
  }

  try {
    const drive = new DriveClient({
      clientEmail: c.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: c.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    });

    // Dynamically resolve/create the subfolder for the department
    const folderId = await drive.findOrCreateFolder(c.env.GOOGLE_DRIVE_ROOT_FOLDER_ID, departmentId);
    const files = await drive.listFiles(folderId);

    return c.json({ success: true, data: { files } });
  } catch (err: any) {
    console.error('[Drive List Error]', err.message);
    return c.json({ success: false, error: { code: 'DRIVE_ERROR', message: 'Failed to list folder files' } }, 500);
  }
});

// ----------------------------------------------------------
// 2. POST /api/v1/files/upload — Upload file
// ----------------------------------------------------------
filesRouter.post('/upload', async (c) => {
  const user = c.get('user');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';

  try {
    const body = await c.req.parseBody();
    const departmentId = body['departmentId'] as string;
    const fileObj = body['file'];

    if (!departmentId || !fileObj || !(fileObj instanceof File)) {
      return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing departmentId or valid file' } }, 400);
    }

    const isPrivileged = user.roles.includes('SYSTEM_SUPER_ADMIN') || user.roles.includes('EXECUTIVE_COUNCIL');
    const isMember = user.departments.includes(departmentId as any);

    if (!isPrivileged && !isMember) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied to upload files' } }, 403);
    }

    const drive = new DriveClient({
      clientEmail: c.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: c.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    });

    const folderId = await drive.findOrCreateFolder(c.env.GOOGLE_DRIVE_ROOT_FOLDER_ID, departmentId);
    const arrayBuffer = await fileObj.arrayBuffer();

    const fileId = await drive.uploadFile(
      folderId,
      fileObj.name,
      fileObj.type || 'application/octet-stream',
      arrayBuffer
    );

    await auditLog(c.env.DB, user.id, 'ADMIN_ACTION', { action: 'file_uploaded', fileId, fileName: fileObj.name, departmentId }, ip, ua);

    return c.json({ success: true, data: { fileId, message: 'File successfully uploaded to Drive.' } });
  } catch (err: any) {
    console.error('[Drive Upload Error]', err.message);
    return c.json({ success: false, error: { code: 'UPLOAD_ERROR', message: 'Failed to upload file to Google Drive' } }, 500);
  }
});

// ----------------------------------------------------------
// 3. GET /api/v1/files/download/:fileId — Secure Proxy Download
// ----------------------------------------------------------
filesRouter.get('/download/:fileId', async (c) => {
  const user = c.get('user');
  const fileId = c.req.param('fileId');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';

  try {
    const drive = new DriveClient({
      clientEmail: c.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: c.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    });

    const { content, mimeType, name } = await drive.downloadFile(fileId);

    await auditLog(c.env.DB, user.id, 'ADMIN_ACTION', { action: 'file_downloaded', fileId, fileName: name }, ip, ua);

    // Set download headers to trigger secure download in the browser
    return c.body(content, 200, {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`,
    });
  } catch (err: any) {
    console.error('[Drive Download Error]', err.message);
    return c.json({ success: false, error: { code: 'DOWNLOAD_ERROR', message: 'Failed to download file from Google Drive' } }, 500);
  }
});
