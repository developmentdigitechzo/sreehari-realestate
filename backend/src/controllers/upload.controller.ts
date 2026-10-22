import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 1. Direct Media Upload (Projects, Plots, Blogs, Popups, Gallery, Settings)
export async function uploadMedia(req: Request, res: Response): Promise<void> {
  try {
    const { imageBase64, filename, title } = req.body;
    if (!imageBase64) {
      res.status(400).json({ success: false, message: 'Media base64 payload is required' });
      return;
    }

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Strip data URI prefix for images and videos
    const base64Data = imageBase64.replace(/^data:(image|video|application)\/[\w-+.]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = '.png';
    if (filename && filename.includes('.')) {
      ext = path.extname(filename).toLowerCase();
    } else if (imageBase64.startsWith('data:video/mp4')) {
      ext = '.mp4';
    } else if (imageBase64.startsWith('data:video/webm')) {
      ext = '.webm';
    } else if (imageBase64.startsWith('data:image/jpeg') || imageBase64.startsWith('data:image/jpg')) {
      ext = '.jpg';
    } else if (imageBase64.startsWith('data:image/webp')) {
      ext = '.webp';
    }

    const cleanBaseName = filename ? path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_') : 'media';
    const newFileName = `${cleanBaseName}-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(uploadsDir, newFileName);

    fs.writeFileSync(filePath, buffer);
    const fileUrl = `/uploads/${newFileName}`;
    const mediaType: 'video' | 'image' = ext.match(/\.(mp4|webm|mov|ogg)$/i) ? 'video' : 'image';
    const mediaId = `upload-${uuidv4()}`;

    res.json({
      success: true,
      fileUrl,
      fileName: newFileName,
      type: mediaType,
      id: mediaId,
      title: title || cleanBaseName.replace(/_/g, ' ')
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to upload media', error: err.message });
  }
}

// Deprecated Media Library Stubs (preserved to avoid route errors)
export async function addExternalMedia(req: Request, res: Response): Promise<void> {
  const { url, title } = req.body;
  res.json({
    success: true,
    message: 'Media added',
    item: { url, title: title || 'Media Asset' }
  });
}

export async function listUploadedMedia(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    count: 0,
    files: []
  });
}

export async function deleteUploadedMedia(req: Request, res: Response): Promise<void> {
  try {
    const rawTarget = req.params.filename || req.body.filename || req.body.url;
    if (rawTarget) {
      const cleanFilename = path.basename(String(rawTarget).replace(/\\/g, '/'));
      const filePath = path.join(__dirname, '../../uploads', cleanFilename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }
    res.json({ success: true, message: 'Media deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete media', error: err.message });
  }
}

export async function updateUploadedMedia(req: Request, res: Response): Promise<void> {
  res.json({ success: true, message: 'Media updated' });
}
