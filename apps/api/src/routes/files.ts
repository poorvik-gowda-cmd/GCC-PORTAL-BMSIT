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

/**
 * Standardize department IDs to match the required 4-branch Google Drive architecture:
 * 1. PHOTOGRAPHY (Photography & Visual Media)
 * 2. DESIGN (Design)
 * 3. EXECUTIVE_COUNCIL (Executive Council — strictly isolated)
 * 4. RESEARCH_PUBLICATION (Research)
 */
function normalizeDepartmentId(raw: string): string {
  const upper = raw.toUpperCase().trim().replace(/-/g, '_');
  if (upper === 'RESEARCH' || upper === 'RESEARCH_PUBLICATION') return 'RESEARCH_PUBLICATION';
  if (upper === 'PHOTOGRAPHY' || upper === 'PHOTOGRAPHY_VISUAL_MEDIA' || upper === 'MEDIA') return 'PHOTOGRAPHY';
  if (upper === 'DESIGN' || upper === 'DESIGN_DESK') return 'DESIGN';
  if (upper === 'EXECUTIVE_COUNCIL' || upper === 'EC') return 'EXECUTIVE_COUNCIL';
  return upper;
}

// ----------------------------------------------------------
// 1. GET /api/v1/files/list — List department files from Drive
// ----------------------------------------------------------
filesRouter.get('/list', async (c) => {
  const user = c.get('user');
  const rawDepartmentId = c.req.query('departmentId');

  if (!rawDepartmentId) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing departmentId' } }, 400);
  }

  const departmentId = normalizeDepartmentId(rawDepartmentId);

  const isPrivileged = user.roles.includes('SYSTEM_SUPER_ADMIN') || user.roles.includes('EXECUTIVE_COUNCIL');
  const isMember = user.departments.includes(departmentId as any) || user.departments.includes(rawDepartmentId as any);

  // --- ACCESS CONTROL GOVERNANCE ---
  // 1. EXECUTIVE COUNCIL: Strictly isolated. Only Executive Council members and Super Admin can view/access these files.
  if (departmentId === 'EXECUTIVE_COUNCIL') {
    if (!isPrivileged && !isMember) {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access to Executive Council files is restricted exclusively to Executive Council members.' } },
        403
      );
    }
  }
  // 2. PHOTOGRAPHY, DESIGN, RESEARCH_PUBLICATION: All relevant portal users can view/access the uploaded files.
  else if (['PHOTOGRAPHY', 'DESIGN', 'RESEARCH_PUBLICATION'].includes(departmentId)) {
    // All authenticated portal users are permitted to view/access these branches.
  }
  // 3. Fallback for other departments: Department members, EC, and Super Admin can view.
  else {
    if (!isPrivileged && !isMember) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied to department files' } }, 403);
    }
  }

  try {
    const drive = new DriveClient({
      clientEmail: c.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: c.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    });

    // Dynamically resolve/create the subfolder for the department branch
    const folderId = await drive.findOrCreateFolder(c.env.GOOGLE_DRIVE_ROOT_FOLDER_ID, departmentId);
    const files = await drive.listFiles(folderId);

    return c.json({ success: true, data: { files, folderId } });
  } catch (err: any) {
    console.error('[Drive List Error]', err.message);
    return c.json({ success: false, error: { code: 'DRIVE_ERROR', message: 'Failed to list folder files' } }, 500);
  }
});

// ----------------------------------------------------------
// 1b. POST /api/v1/files/setup-departments — Configure Drive Folders & Permissions
// ----------------------------------------------------------
filesRouter.post('/setup-departments', async (c) => {
  const user = c.get('user');
  const isPrivileged = user.roles.includes('SYSTEM_SUPER_ADMIN') || user.roles.includes('EXECUTIVE_COUNCIL');
  if (!isPrivileged) {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Only administrators can setup department folders.' } }, 403);
  }

  try {
    const drive = new DriveClient({
      clientEmail: c.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: c.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    });

    const body = await c.req.json().catch(() => ({} as Record<string, any>));
    const userEmail = body.email || 'poorvikgowda30@gmail.com';

    const departments = ['PHOTOGRAPHY', 'DESIGN', 'RESEARCH_PUBLICATION', 'EXECUTIVE_COUNCIL'];
    const results: Record<string, any> = {};

    for (const dept of departments) {
      try {
        const folderId = await drive.findOrCreateFolder(c.env.GOOGLE_DRIVE_ROOT_FOLDER_ID, dept);

        // 1. Give the owner/admin email full writer/editor access
        const userPerm = await drive.addPermission(folderId, {
          role: 'writer',
          type: 'user',
          emailAddress: userEmail,
        });

        // 2. For non-executive branches, set 'anyone with the link can edit'
        let publicPerm = null;
        if (dept !== 'EXECUTIVE_COUNCIL') {
          publicPerm = await drive.addPermission(folderId, {
            role: 'writer',
            type: 'anyone',
          });
        }

        results[dept] = {
          folderId,
          driveUrl: `https://drive.google.com/drive/folders/${folderId}`,
          userPermission: userPerm,
          publicPermission: publicPerm,
        };
      } catch (err: any) {
        results[dept] = { error: err.message };
      }
    }

    return c.json({ success: true, data: { userEmail, results } });
  } catch (err: any) {
    console.error('[Drive Setup Error]', err.message);
    return c.json({ success: false, error: { code: 'DRIVE_ERROR', message: err.message } }, 500);
  }
});

// ----------------------------------------------------------
// 2. POST /api/v1/files/upload — Upload file to Google Drive branch
// ----------------------------------------------------------
filesRouter.post('/upload', async (c) => {
  const user = c.get('user');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';

  try {
    const body = await c.req.parseBody();
    const rawDepartmentId = body['departmentId'] as string;
    const fileObj = body['file'];

    if (!rawDepartmentId || !fileObj || !(fileObj instanceof File)) {
      return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing departmentId or valid file' } }, 400);
    }

    const departmentId = normalizeDepartmentId(rawDepartmentId);

    const isPrivileged = user.roles.includes('SYSTEM_SUPER_ADMIN') || user.roles.includes('EXECUTIVE_COUNCIL');
    const isMember = user.departments.includes(departmentId as any) || user.departments.includes(rawDepartmentId as any);

    // Upload Rules: Department team members and EC/SuperAdmin can upload to their respective branch.
    if (!isPrivileged && !isMember) {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: `Upload access denied. Only ${departmentId.replace('_', ' ')} team members can upload files to this branch.` } },
        403
      );
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

    const isPrivileged = user.roles.includes('SYSTEM_SUPER_ADMIN') || user.roles.includes('EXECUTIVE_COUNCIL') || user.departments.includes('EXECUTIVE_COUNCIL');

    // Get Executive Council folder ID to check strict isolation
    const ecFolderId = await drive.findOrCreateFolder(c.env.GOOGLE_DRIVE_ROOT_FOLDER_ID, 'EXECUTIVE_COUNCIL');

    const { content, mimeType, name, parents } = await drive.downloadFile(fileId);

    // Enforce strict isolation: Executive Council files can only be accessed by Executive Council members
    if (parents && parents.includes(ecFolderId) && !isPrivileged) {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access to Executive Council files is restricted exclusively to Executive Council members.' } },
        403
      );
    }

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
