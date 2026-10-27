import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export interface PopupRecord {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  badge_tag?: string;
  banner_image?: string;
  highlights?: string;
  cta_text?: string;
  cta_action?: string;
  whatsapp_number?: string;
  custom_url?: string;
  start_date?: string | null;
  end_date?: string | null;
  layout_style?: string;
  display_delay?: string;
  show_frequency?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at?: string;
}

// 1. Get All Popups (Admin)
export async function getAllPopups(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let popups: any[] = [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM popups ORDER BY created_at DESC;');
        popups = pgRes.rows || [];
        const pgIds = new Set(popups.map((p: any) => p.id));
        for (const fbPopup of store.popups || []) {
          if (!pgIds.has(fbPopup.id)) {
            popups.push(fbPopup);
          }
        }
      } catch (err: any) {
        console.error('PostgreSQL popups SELECT error:', err.message);
        popups = store.popups || [];
      }
    } else {
      popups = store.popups || [];
    }

    res.json({
      success: true,
      count: popups.length,
      data: popups
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch popups', error: err.message });
  }
}

// 2. Get Active Popups (Public Website)
export async function getActivePopups(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let popups: any[] = [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query("SELECT * FROM popups WHERE status = 'Active' ORDER BY created_at DESC;");
        popups = pgRes.rows || [];
        const pgIds = new Set(popups.map((p: any) => p.id));
        for (const fbPopup of store.popups || []) {
          if (!pgIds.has(fbPopup.id) && (fbPopup.status || 'Active') === 'Active') {
            popups.push(fbPopup);
          }
        }
      } catch {
        popups = (store.popups || []).filter((p: any) => (p.status || 'Active') === 'Active');
      }
    } else {
      popups = (store.popups || []).filter((p: any) => (p.status || 'Active') === 'Active');
    }

    res.json({
      success: true,
      count: popups.length,
      data: popups
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch active popups', error: err.message });
  }
}

// 3. Create New Popup
export async function createPopup(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      subtitle,
      category,
      badge_tag,
      banner_image,
      highlights,
      cta_text,
      cta_action,
      whatsapp_number,
      custom_url,
      start_date,
      end_date,
      layout_style,
      display_delay,
      show_frequency,
      status
    } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Popup title is required' });
      return;
    }

    const popupId = uuidv4();
    const defaultBanner = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';

    const newPopup: PopupRecord = {
      id: popupId,
      title: title.trim(),
      subtitle: subtitle || '',
      category: category !== undefined ? category : '',
      badge_tag: badge_tag !== undefined ? badge_tag : '',
      banner_image: banner_image && banner_image.trim() !== '' ? banner_image.trim() : defaultBanner,
      highlights: highlights || '',
      cta_text: cta_text || 'Claim Offer on WhatsApp',
      cta_action: cta_action || 'whatsapp',
      whatsapp_number: whatsapp_number !== undefined ? whatsapp_number : '+91 73737 13559',
      custom_url: custom_url || '',
      start_date: start_date || null,
      end_date: end_date || null,
      layout_style: layout_style || 'Auto Detect',
      display_delay: display_delay || '3s',
      show_frequency: show_frequency || 'Once per Session',
      status: status || 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO popups (
            id, title, subtitle, category, badge_tag, banner_image, highlights, cta_text, cta_action, whatsapp_number, custom_url, start_date, end_date, layout_style, display_delay, show_frequency, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`,
          [
            newPopup.id,
            newPopup.title,
            newPopup.subtitle,
            newPopup.category,
            newPopup.badge_tag,
            newPopup.banner_image,
            newPopup.highlights,
            newPopup.cta_text,
            newPopup.cta_action,
            newPopup.whatsapp_number,
            newPopup.custom_url,
            newPopup.start_date,
            newPopup.end_date,
            newPopup.layout_style,
            newPopup.display_delay,
            newPopup.show_frequency,
            newPopup.status
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL popup INSERT error:', pgErr.message);
      }
    }

    const store = db.getFallbackData();
    if (!store.popups) store.popups = [];
    store.popups.unshift(newPopup);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Promotional popup created successfully',
      data: newPopup
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create popup', error: err.message });
  }
}

// 4. Update Popup
export async function updatePopup(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    if (!store.popups) store.popups = [];
    const index = store.popups.findIndex((p: any) => p.id === id);

    let current: any = {};
    if (db.isPostgres()) {
      try {
        const pgCurrent = await db.query('SELECT * FROM popups WHERE id = $1;', [id]);
        if (pgCurrent.rows && pgCurrent.rows.length > 0) {
          current = pgCurrent.rows[0];
        }
      } catch {}
    }
    if (!current.id && index !== -1) {
      current = store.popups[index];
    }
    const updated: PopupRecord = {
      ...current,
      ...req.body,
      id,
      title: req.body.title !== undefined ? req.body.title : (current.title || ''),
      banner_image: req.body.banner_image !== undefined ? req.body.banner_image : (current.banner_image || ''),
      category: req.body.category !== undefined ? req.body.category : (current.category || ''),
      badge_tag: req.body.badge_tag !== undefined ? req.body.badge_tag : (current.badge_tag || ''),
      whatsapp_number: req.body.whatsapp_number !== undefined ? req.body.whatsapp_number : (current.whatsapp_number || '+91 73737 13559'),
      custom_url: req.body.custom_url !== undefined ? req.body.custom_url : (current.custom_url || ''),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO popups (
            id, title, subtitle, category, badge_tag, banner_image, highlights, cta_text, cta_action, whatsapp_number, custom_url, start_date, end_date, layout_style, display_delay, show_frequency, status, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            category = EXCLUDED.category,
            badge_tag = EXCLUDED.badge_tag,
            banner_image = EXCLUDED.banner_image,
            highlights = EXCLUDED.highlights,
            cta_text = EXCLUDED.cta_text,
            cta_action = EXCLUDED.cta_action,
            whatsapp_number = EXCLUDED.whatsapp_number,
            custom_url = EXCLUDED.custom_url,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            layout_style = EXCLUDED.layout_style,
            display_delay = EXCLUDED.display_delay,
            show_frequency = EXCLUDED.show_frequency,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP;`,
          [
            id,
            updated.title || '',
            updated.subtitle || '',
            updated.category !== undefined ? updated.category : '',
            updated.badge_tag !== undefined ? updated.badge_tag : '',
            updated.banner_image || '',
            updated.highlights || '',
            updated.cta_text || '',
            updated.cta_action || 'whatsapp',
            updated.whatsapp_number || '+91 73737 13559',
            updated.custom_url || '',
            updated.start_date || null,
            updated.end_date || null,
            updated.layout_style || 'Auto Detect',
            updated.display_delay || '3s',
            updated.show_frequency || 'Once per Session',
            updated.status || 'Active'
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL popup UPDATE error:', pgErr.message);
      }
    }

    if (index !== -1) {
      store.popups[index] = updated;
    } else {
      store.popups.push(updated);
    }
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Popup updated successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update popup', error: err.message });
  }
}

// 5. Delete Popup
export async function deletePopup(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    if (!store.popups) store.popups = [];

    if (db.isPostgres()) {
      try {
        await db.query('DELETE FROM popups WHERE id = $1;', [id]);
      } catch (pgErr: any) {
        console.error('PostgreSQL popup DELETE error:', pgErr.message);
      }
    }

    store.popups = store.popups.filter((p: any) => p.id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Popup deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete popup', error: err.message });
  }
}
