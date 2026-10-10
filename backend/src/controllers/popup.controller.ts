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
    let popups: any[] = store.popups || [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM popups ORDER BY created_at DESC;');
        if (pgRes.rows.length > 0) popups = pgRes.rows;
      } catch (err: any) {
        console.error('PostgreSQL popups SELECT error:', err.message);
      }
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
    let popups: any[] = store.popups || [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query("SELECT * FROM popups WHERE status = 'Active' ORDER BY created_at DESC;");
        if (pgRes.rows.length > 0) popups = pgRes.rows;
      } catch {}
    }

    const activePopups = popups.filter(p => (p.status || 'Active') === 'Active');

    res.json({
      success: true,
      count: activePopups.length,
      data: activePopups
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
    const store = db.getFallbackData();
    if (!store.popups) store.popups = [];

    const defaultBanner = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';

    const newPopup: PopupRecord = {
      id: popupId,
      title: title.trim(),
      subtitle: subtitle || '',
      category: category || 'Festival',
      badge_tag: badge_tag || 'FESTIVE OFFER',
      banner_image: banner_image && banner_image.trim() !== '' ? banner_image.trim() : defaultBanner,
      highlights: highlights || '',
      cta_text: cta_text || 'Claim Offer on WhatsApp',
      cta_action: cta_action || 'whatsapp',
      whatsapp_number: whatsapp_number || '+91 98424 01991',
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
            id, title, subtitle, category, badge_tag, banner_image, highlights, cta_text, cta_action, whatsapp_number, start_date, end_date, layout_style, display_delay, show_frequency, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
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

    const current = index !== -1 ? store.popups[index] : {};
    const updated = {
      ...current,
      ...req.body,
      id,
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE popups SET
            title=$1, subtitle=$2, category=$3, badge_tag=$4, banner_image=$5, highlights=$6, cta_text=$7, cta_action=$8, whatsapp_number=$9, start_date=$10, end_date=$11, layout_style=$12, display_delay=$13, show_frequency=$14, status=$15, updated_at=CURRENT_TIMESTAMP
          WHERE id=$16;`,
          [
            updated.title || '',
            updated.subtitle || '',
            updated.category || 'Festival',
            updated.badge_tag || 'FESTIVE OFFER',
            updated.banner_image || '',
            updated.highlights || '',
            updated.cta_text || '',
            updated.cta_action || 'whatsapp',
            updated.whatsapp_number || '+91 98424 01991',
            updated.start_date || null,
            updated.end_date || null,
            updated.layout_style || 'Auto Detect',
            updated.display_delay || '3s',
            updated.show_frequency || 'Once per Session',
            updated.status || 'Active',
            id
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
