import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export async function getAllBlogs(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let blogs = store.blogs || [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM blogs ORDER BY created_at DESC;');
        if (pgRes.rows.length > 0) blogs = pgRes.rows;
      } catch (err: any) {
        console.error('PostgreSQL blogs SELECT error:', err.message);
      }
    }

    let mappedBlogs = blogs.map((b: any) => ({
      ...b,
      image_url: b.image_url || b.banner_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      banner_image: b.banner_image || b.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      seo_title: b.seo_title || b.meta_title || b.title,
      seo_description: b.seo_description || b.meta_description || b.excerpt || ''
    }));

    const isPublic = req.baseUrl.includes('public') || req.originalUrl.includes('/public');
    if (isPublic) {
      mappedBlogs = mappedBlogs.filter((b: any) => (b.status || 'Published').toLowerCase() === 'published');
    } else if (req.query.status && typeof req.query.status === 'string' && req.query.status !== 'All Statuses') {
      mappedBlogs = mappedBlogs.filter((b: any) => (b.status || '').toLowerCase() === (req.query.status as string).toLowerCase());
    }

    res.json({
      success: true,
      count: mappedBlogs.length,
      data: mappedBlogs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs', error: err.message });
  }
}

export async function getBlogById(req: Request, res: Response): Promise<void> {
  const id = req.params.id || req.params.slug;
  try {
    const store = db.getFallbackData();
    let blog = (store.blogs || []).find((b: any) => b.id === id || b.slug === id);

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM blogs WHERE id = $1 OR slug = $1 LIMIT 1;', [id]);
        if (pgRes.rows.length > 0) blog = pgRes.rows[0];
      } catch {}
    }

    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog post not found' });
      return;
    }

    const isPublic = req.baseUrl.includes('public') || req.originalUrl.includes('/public');
    if (isPublic && (blog.status || '').toLowerCase() === 'draft') {
      res.status(404).json({ success: false, message: 'Blog post is in draft state' });
      return;
    }

    const mappedBlog = {
      ...blog,
      image_url: blog.image_url || blog.banner_image || '',
      banner_image: blog.banner_image || blog.image_url || '',
      seo_title: blog.seo_title || blog.meta_title || blog.title,
      seo_description: blog.seo_description || blog.meta_description || blog.excerpt || ''
    };

    res.json({
      success: true,
      data: mappedBlog
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch blog post', error: err.message });
  }
}

export async function createBlog(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      slug,
      category,
      author,
      status,
      read_time,
      banner_image,
      image_url,
      excerpt,
      content,
      meta_title,
      seo_title,
      meta_description,
      seo_description
    } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Blog title is required' });
      return;
    }

    const blogId = uuidv4();
    const computedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const store = db.getFallbackData();
    if (!store.blogs) store.blogs = [];

    const finalImage = image_url || banner_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
    const finalSeoTitle = seo_title || meta_title || title;
    const finalSeoDesc = seo_description || meta_description || excerpt || '';

    const newBlog = {
      id: blogId,
      title,
      slug: computedSlug,
      category: category || 'Buying Guide',
      author: author || 'Sree Hari Realty Editorial',
      status: status || 'Published',
      read_time: read_time || '5 min read',
      banner_image: finalImage,
      image_url: finalImage,
      excerpt: excerpt || '',
      content: content || '',
      meta_title: finalSeoTitle,
      seo_title: finalSeoTitle,
      meta_description: finalSeoDesc,
      seo_description: finalSeoDesc,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO blogs (
            id, title, slug, category, author, status, read_time, banner_image, excerpt, content, meta_title, meta_description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
          [
            newBlog.id,
            newBlog.title,
            newBlog.slug,
            newBlog.category,
            newBlog.author,
            newBlog.status,
            newBlog.read_time,
            newBlog.banner_image,
            newBlog.excerpt,
            newBlog.content,
            newBlog.meta_title,
            newBlog.meta_description
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Blog INSERT error:', pgErr.message);
      }
    }

    store.blogs.unshift(newBlog);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: newBlog
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create blog post', error: err.message });
  }
}

export async function updateBlog(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    if (!store.blogs) store.blogs = [];
    const index = store.blogs.findIndex((b: any) => b.id === id);

    const current = index !== -1 ? store.blogs[index] : {};
    const finalImage = req.body.image_url || req.body.banner_image || current.image_url || current.banner_image || '';
    const finalSeoTitle = req.body.seo_title || req.body.meta_title || current.seo_title || current.meta_title || current.title || '';
    const finalSeoDesc = req.body.seo_description || req.body.meta_description || current.seo_description || current.meta_description || current.excerpt || '';

    const updated = {
      ...current,
      ...req.body,
      id,
      image_url: finalImage,
      banner_image: finalImage,
      seo_title: finalSeoTitle,
      meta_title: finalSeoTitle,
      seo_description: finalSeoDesc,
      meta_description: finalSeoDesc,
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE blogs SET
            title=$1, slug=$2, category=$3, author=$4, status=$5, read_time=$6, banner_image=$7, excerpt=$8, content=$9, meta_title=$10, meta_description=$11, image_url=$12, seo_title=$13, seo_description=$14, updated_at=CURRENT_TIMESTAMP
          WHERE id=$15;`,
          [
            updated.title || '',
            updated.slug || '',
            updated.category || 'Buying Guide',
            updated.author || 'Sree Hari Realty Editorial',
            updated.status || 'Published',
            updated.read_time || '5 min read',
            updated.banner_image || '',
            updated.excerpt || '',
            updated.content || '',
            updated.meta_title || '',
            updated.meta_description || '',
            updated.image_url || updated.banner_image || '',
            updated.seo_title || updated.meta_title || updated.title || '',
            updated.seo_description || updated.meta_description || updated.excerpt || '',
            id
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Blog UPDATE error:', pgErr.message);
      }
    }

    if (index !== -1) {
      store.blogs[index] = updated;
    } else {
      store.blogs.push(updated);
    }
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update blog post', error: err.message });
  }
}

export async function deleteBlog(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    if (!store.blogs) store.blogs = [];

    if (db.isPostgres()) {
      try {
        await db.query('DELETE FROM blogs WHERE id = $1;', [id]);
      } catch (pgErr: any) {
        console.error('PostgreSQL Blog DELETE error:', pgErr.message);
      }
    }

    store.blogs = store.blogs.filter((b: any) => b.id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete blog post', error: err.message });
  }
}
