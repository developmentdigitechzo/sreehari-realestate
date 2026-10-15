import { Request, Response } from 'express';
import { db } from '../config/db';

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let currentSettings = { ...store.settings };

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT key, value FROM settings;');
        if (pgRes.rows && pgRes.rows.length > 0) {
          for (const row of pgRes.rows) {
            try {
              currentSettings[row.key] = JSON.parse(row.value);
            } catch {
              currentSettings[row.key] = row.value;
            }
          }
        }
      } catch (err: any) {
        console.error('PostgreSQL settings SELECT error:', err.message);
      }
    }

    res.json({
      success: true,
      data: currentSettings
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

    if (db.isPostgres()) {
      try {
        for (const [key, val] of Object.entries(req.body)) {
          const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
          await db.query(
            `INSERT INTO settings (key, value, updated_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;`,
            [key, strVal]
          );
        }
      } catch (err: any) {
        console.error('PostgreSQL settings UPDATE error:', err.message);
      }
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: store.settings
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
}
