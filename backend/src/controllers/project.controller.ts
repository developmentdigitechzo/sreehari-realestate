import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function getPublicProjects(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let projects = store.projects;

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM projects WHERE status != $1 ORDER BY created_at DESC;', ['Draft']);
        if (pgRes.rows.length > 0) projects = pgRes.rows;
      } catch {}
    }

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: err.message });
  }
}

export async function getPublicProjectBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;

  try {
    const store = db.getFallbackData();
    let project = store.projects.find((p: any) => p.slug === slug);

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM projects WHERE slug = $1;', [slug]);
        if (pgRes.rows.length > 0) project = pgRes.rows[0];
      } catch {}
    }

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({
      success: true,
      data: project
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch project details', error: err.message });
  }
}

export async function getAllProjectsAdmin(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let projects = store.projects;

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM projects ORDER BY created_at DESC;');
        if (pgRes.rows.length > 0) projects = pgRes.rows;
      } catch {}
    }

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin projects', error: err.message });
  }
}

export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      tagline,
      description,
      location_area,
      location_city,
      total_extent_acres,
      total_plots_count,
      plot_size_range,
      price_range,
      status,
      is_featured,
      banner_image
    } = req.body;

    if (!name || !location_area) {
      res.status(400).json({ success: false, message: 'Project name and location are required' });
      return;
    }

    const store = db.getFallbackData();
    let slug = slugify(name);
    let counter = 1;
    while (store.projects.some((p: any) => p.slug === slug)) {
      slug = `${slugify(name)}-${counter++}`;
    }

    const newProject = {
      id: uuidv4(),
      name,
      slug,
      tagline: tagline || '',
      description: description || '',
      location_area,
      location_city: location_city || 'Trichy',
      total_extent_acres: Number(total_extent_acres) || 0,
      total_plots_count: Number(total_plots_count) || 0,
      plot_size_range: plot_size_range || '1200 - 2400 Sq.Ft',
      price_range: price_range || 'Contact for Price',
      status: status || 'Upcoming',
      is_featured: Boolean(is_featured),
      banner_image: banner_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO projects (id, name, slug, tagline, description, location_area, location_city, total_extent_acres, total_plots_count, plot_size_range, price_range, status, is_featured, banner_image)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
          [
            newProject.id,
            newProject.name,
            newProject.slug,
            newProject.tagline,
            newProject.description,
            newProject.location_area,
            newProject.location_city,
            newProject.total_extent_acres,
            newProject.total_plots_count,
            newProject.plot_size_range,
            newProject.price_range,
            newProject.status,
            newProject.is_featured,
            newProject.banner_image
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Project INSERT error:', pgErr.message);
      }
    }

    store.projects.push(newProject);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create project', error: err.message });
  }
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    const index = store.projects.findIndex((p: any) => p.id === id);

    const current = index !== -1 ? store.projects[index] : {};
    const updated = {
      ...current,
      ...req.body,
      id,
      slug: req.body.name && req.body.name !== current.name ? slugify(req.body.name) : current.slug || slugify(req.body.name || 'project'),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE projects SET name=$1, slug=$2, tagline=$3, location_area=$4, location_city=$5, total_extent_acres=$6, total_plots_count=$7, status=$8, updated_at=CURRENT_TIMESTAMP WHERE id=$9;`,
          [updated.name, updated.slug, updated.tagline, updated.location_area, updated.location_city, updated.total_extent_acres, updated.total_plots_count, updated.status, id]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Project UPDATE error:', pgErr.message);
      }
    }

    if (index !== -1) {
      store.projects[index] = updated;
    } else {
      store.projects.push(updated);
    }
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update project', error: err.message });
  }
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();

    if (db.isPostgres()) {
      try {
        await db.query('DELETE FROM projects WHERE id = $1;', [id]);
      } catch (pgErr: any) {
        console.error('PostgreSQL Project DELETE error:', pgErr.message);
      }
    }

    store.projects = store.projects.filter((p: any) => p.id !== id);
    store.plots = store.plots.filter((p: any) => p.project_id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: err.message });
  }
}
