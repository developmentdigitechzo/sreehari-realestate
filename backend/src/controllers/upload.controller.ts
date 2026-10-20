import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

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
    const mediaTitle = title || cleanBaseName.replace(/_/g, ' ');
    const createdAt = new Date().toISOString();

    // Persist to Fallback DB
    const store = db.getFallbackData();
    if (!Array.isArray(store.media_library)) {
      store.media_library = [];
    }
    const mediaItem = {
      id: mediaId,
      title: mediaTitle,
      fileName: newFileName,
      url: fileUrl,
      type: mediaType,
      sizeBytes: buffer.length,
      createdAt
    };
    store.media_library.unshift(mediaItem);
    db.saveFallbackData(store);

    // Persist to PostgreSQL if available
    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO media_library (id, title, filename, url, type, size_bytes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, filename = EXCLUDED.filename;`,
          [mediaId, mediaTitle, newFileName, fileUrl, mediaType, buffer.length, createdAt]
        );
      } catch (pgErr: any) {
        console.warn('PostgreSQL media_library insert notice:', pgErr.message);
      }
    }

    res.json({
      success: true,
      fileUrl,
      fileName: newFileName,
      type: mediaType,
      id: mediaId,
      title: mediaTitle
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to upload media', error: err.message });
  }
}

export async function addExternalMedia(req: Request, res: Response): Promise<void> {
  try {
    const { url, title, type } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, message: 'Media URL is required' });
      return;
    }

    const trimmedUrl = url.trim();
    const isVideo = type === 'video' || Boolean(trimmedUrl.match(/\.(mp4|webm|mov|ogg)$/i)) || trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be');
    const mediaType: 'video' | 'image' = isVideo ? 'video' : 'image';
    const mediaId = `ext-${uuidv4()}`;
    const mediaTitle = title?.trim() || (isVideo ? 'External Video Asset' : 'External Image Asset');
    const fileName = path.basename(trimmedUrl.split('?')[0]) || 'external-asset';
    const createdAt = new Date().toISOString();

    const store = db.getFallbackData();
    if (!Array.isArray(store.media_library)) {
      store.media_library = [];
    }

    const mediaItem = {
      id: mediaId,
      title: mediaTitle,
      fileName,
      url: trimmedUrl,
      type: mediaType,
      sizeBytes: 0,
      createdAt
    };

    // Prepend and save
    store.media_library = [mediaItem, ...store.media_library.filter((m: any) => m.url !== trimmedUrl)];
    db.saveFallbackData(store);

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO media_library (id, title, filename, url, type, size_bytes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;`,
          [mediaId, mediaTitle, fileName, trimmedUrl, mediaType, 0, createdAt]
        );
      } catch (pgErr: any) {
        console.warn('PostgreSQL external media_library insert notice:', pgErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Media added to library',
      item: mediaItem
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add external media', error: err.message });
  }
}

export async function listUploadedMedia(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let libraryItems: any[] = Array.isArray(store.media_library) ? [...store.media_library] : [];

    // Check PostgreSQL if running
    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM media_library ORDER BY created_at DESC;');
        if (pgRes.rows && pgRes.rows.length > 0) {
          libraryItems = pgRes.rows.map((row) => ({
            id: row.id,
            title: row.title || row.filename,
            fileName: row.filename || row.fileName,
            url: row.url,
            type: row.type,
            sizeBytes: Number(row.size_bytes || 0),
            createdAt: row.created_at
          }));
        }
      } catch (pgErr: any) {
        console.warn('PostgreSQL media_library list warning:', pgErr.message);
      }
    }

    // Auto-discover any untracked files in uploads/ and register them
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const diskFiles = fs.readdirSync(uploadsDir);
      const existingUrls = new Set(libraryItems.map((m) => m.url));
      let diskUpdated = false;

      diskFiles
        .filter((file) => !file.startsWith('.') && file.match(/\.(png|jpg|jpeg|webp|gif|svg|mp4|webm|mov|ogg)$/i))
        .forEach((file) => {
          const fileUrl = `/uploads/${file}`;
          if (!existingUrls.has(fileUrl)) {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            const isVideo = Boolean(file.match(/\.(mp4|webm|mov|ogg)$/i));
            const newItem = {
              id: `disk-${file}`,
              title: file.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, ''),
              fileName: file,
              url: fileUrl,
              type: isVideo ? 'video' : 'image',
              sizeBytes: stats.size,
              createdAt: stats.birthtime ? stats.birthtime.toISOString() : stats.mtime.toISOString()
            };
            libraryItems.unshift(newItem);
            diskUpdated = true;
          }
        });

      if (diskUpdated) {
        store.media_library = libraryItems;
        db.saveFallbackData(store);
      }
    }

    // Sort newest first
    libraryItems.sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());

    res.json({
      success: true,
      count: libraryItems.length,
      files: libraryItems
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to list media library', error: err.message });
  }
}

export async function deleteUploadedMedia(req: Request, res: Response): Promise<void> {
  try {
    const rawTarget = req.params.filename || req.body.filename || req.body.url || req.body.id || req.query.filename || req.query.url;
    if (!rawTarget || typeof rawTarget !== 'string') {
      res.status(400).json({ success: false, message: 'Filename, URL, or ID is required' });
      return;
    }

    const cleanFilename = path.basename(rawTarget.replace(/\\/g, '/'));
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, cleanFilename);

    // 1. Delete physical file from disk if it exists
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr: any) {
        console.warn('Failed to delete physical file from disk:', unlinkErr.message);
      }
    }

    // 2. Permanently remove from fallback database
    const store = db.getFallbackData();
    if (Array.isArray(store.media_library)) {
      store.media_library = store.media_library.filter(
        (m: any) =>
          m.fileName !== cleanFilename &&
          m.filename !== cleanFilename &&
          m.url !== rawTarget &&
          m.id !== rawTarget &&
          m.url !== `/uploads/${cleanFilename}`
      );
      db.saveFallbackData(store);
    }

    // 3. Permanently remove from PostgreSQL if available
    if (db.isPostgres()) {
      try {
        await db.query(
          `DELETE FROM media_library
           WHERE filename = $1 OR url = $1 OR id = $1 OR url = $2;`,
          [cleanFilename, `/uploads/${cleanFilename}`]
        );
      } catch (pgErr: any) {
        console.warn('PostgreSQL media_library delete notice:', pgErr.message);
      }
    }

    res.json({
      success: true,
      message: `Media item ${cleanFilename} permanently deleted from library database and storage`,
      deletedFile: cleanFilename
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete media', error: err.message });
  }
}

export async function updateUploadedMedia(req: Request, res: Response): Promise<void> {
  try {
    const rawTarget = req.params.filename || req.body.filename || req.body.url || req.body.id;
    const { title, newName } = req.body;
    if (!rawTarget) {
      res.status(400).json({ success: false, message: 'Identifier is required' });
      return;
    }

    const cleanFilename = path.basename(String(rawTarget).replace(/\\/g, '/'));
    const uploadsDir = path.join(__dirname, '../../uploads');
    const oldPath = path.join(uploadsDir, cleanFilename);

    let finalFilename = cleanFilename;
    let fileUrl = `/uploads/${cleanFilename}`;

    if (newName && typeof newName === 'string' && newName.trim() !== '') {
      const ext = path.extname(cleanFilename);
      const cleanNewBase = path.basename(newName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedNewName = `${cleanNewBase}${ext}`;
      const newPath = path.join(uploadsDir, sanitizedNewName);

      if (fs.existsSync(oldPath) && oldPath !== newPath && !fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        finalFilename = sanitizedNewName;
        fileUrl = `/uploads/${sanitizedNewName}`;
      }
    }

    // Update in fallback storage
    const store = db.getFallbackData();
    if (Array.isArray(store.media_library)) {
      store.media_library = store.media_library.map((m: any) => {
        if (m.fileName === cleanFilename || m.url === rawTarget || m.id === rawTarget) {
          return {
            ...m,
            title: title || m.title || finalFilename,
            fileName: finalFilename,
            url: fileUrl
          };
        }
        return m;
      });
      db.saveFallbackData(store);
    }

    // Update in PostgreSQL
    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE media_library
           SET title = COALESCE($1, title), filename = $2, url = $3
           WHERE filename = $4 OR url = $4 OR id = $4;`,
          [title, finalFilename, fileUrl, cleanFilename]
        );
      } catch (pgErr: any) {
        console.warn('PostgreSQL media_library update notice:', pgErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Media updated successfully in library database',
      fileName: finalFilename,
      fileUrl,
      title: title || finalFilename
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update media', error: err.message });
  }
}
