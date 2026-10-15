import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  try {
    const { imageBase64, filename } = req.body;
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

    res.json({
      success: true,
      fileUrl,
      fileName: newFileName,
      type: ext.match(/\.(mp4|webm|mov|ogg)$/i) ? 'video' : 'image'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to upload media', error: err.message });
  }
}

export async function listUploadedMedia(req: Request, res: Response): Promise<void> {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      res.json({ success: true, count: 0, files: [] });
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const mediaFiles = files
      .filter((file) => !file.startsWith('.') && file.match(/\.(png|jpg|jpeg|webp|gif|svg|mp4|webm|mov|ogg)$/i))
      .map((file) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const isVideo = Boolean(file.match(/\.(mp4|webm|mov|ogg)$/i));
        return {
          fileName: file,
          url: `/uploads/${file}`,
          type: isVideo ? 'video' : 'image',
          sizeBytes: stats.size,
          createdAt: stats.birthtime ? stats.birthtime.toISOString() : stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: mediaFiles.length,
      files: mediaFiles
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to list uploaded media', error: err.message });
  }
}

