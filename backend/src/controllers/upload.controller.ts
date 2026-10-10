import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      res.status(400).json({ success: false, message: 'Image base64 payload is required' });
      return;
    }

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = filename && filename.includes('.') ? path.extname(filename) : '.png';
    const newFileName = `media-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(uploadsDir, newFileName);

    fs.writeFileSync(filePath, buffer);
    const fileUrl = `http://localhost:5000/uploads/${newFileName}`;

    res.json({
      success: true,
      fileUrl,
      fileName: newFileName
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to upload media', error: err.message });
  }
}
