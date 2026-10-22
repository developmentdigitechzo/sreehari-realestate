import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export async function getPublicGallery(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    const { category } = req.query;
    let items = [...store.gallery];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC;');
        items = pgRes.rows;
      } catch (err: any) {
        console.error('PostgreSQL gallery SELECT error:', err.message);
      }
    }

    if (category && typeof category === 'string' && category !== 'All') {
      items = items.filter((item: any) => item.category.toLowerCase() === category.toLowerCase());
    }

    items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch gallery', error: err.message });
  }
}

export async function addGalleryItem(req: Request, res: Response): Promise<void> {
  try {
    const { title, image_url, category, sort_order } = req.body;

    if (!title || !image_url) {
      res.status(400).json({ success: false, message: 'Title and Image URL are required' });
      return;
    }

    const store = db.getFallbackData();
    const newItem = {
      id: uuidv4(),
      title,
      image_url,
      category: category || 'General',
      sort_order: Number(sort_order) || store.gallery.length + 1,
      created_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO gallery (id, title, image_url, category, sort_order, created_at)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [newItem.id, newItem.title, newItem.image_url, newItem.category, newItem.sort_order, newItem.created_at]
        );
      } catch (err: any) {
        console.error('PostgreSQL gallery INSERT error:', err.message);
      }
    }

    store.gallery.push(newItem);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Gallery item added',
      data: newItem
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add gallery item', error: err.message });
  }
}

export async function deleteGalleryItem(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();

    if (db.isPostgres()) {
      try {
        await db.query('DELETE FROM gallery WHERE id = $1;', [id]);
      } catch (err: any) {
        console.error('PostgreSQL gallery DELETE error:', err.message);
      }
    }

    const initialLen = store.gallery.length;
    store.gallery = store.gallery.filter((g: any) => g.id !== id);

    if (store.gallery.length === initialLen && !db.isPostgres()) {
      res.status(404).json({ success: false, message: 'Gallery item not found' });
      return;
    }

    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Gallery item deleted'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete gallery item', error: err.message });
  }
}
