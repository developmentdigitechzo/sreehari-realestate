import { Request, Response } from 'express';
import { db } from '../config/db';

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    res.json({
      success: true,
      data: store.settings
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: err.message });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    store.settings = {
      ...store.settings,
      ...req.body
    };
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: store.settings
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
}
