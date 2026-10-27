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

function parseJsonField(val: any, fallback: any = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export async function getPublicProjects(req: Request, res: Response): Promise<void> {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    let projects: any[] = [];

    const store = db.getFallbackData();
    if (db.isPostgres()) {
      try {
        const pgRes = await db.query(
          `SELECT id, name, slug, tagline, description, location_area, location_city,
                  total_extent_acres, total_plots_count, available_plots_count, plot_size_range,
                  status, is_featured, banner_image, video_url, brochure_url,
                  google_maps_embed_url, dtcp_number, rera_number, gallery_images,
                  highlights, amenities, nearby_landmarks, latitude, longitude, created_at, updated_at
           FROM projects
           WHERE status NOT IN ('Draft', 'Unpublished', 'Deleted')
           ORDER BY created_at DESC;`
        );
        projects = pgRes.rows || [];
        const pgIds = new Set(projects.map((p: any) => p.id));
        for (const fbProj of store.projects || []) {
          if (!pgIds.has(fbProj.id) && fbProj.status !== 'Draft' && fbProj.status !== 'Unpublished' && fbProj.status !== 'Deleted') {
            projects.push(fbProj);
          }
        }
      } catch (err: any) {
        console.error('getPublicProjects PG Error:', err.message);
        projects = (store.projects || []).filter(
          (p: any) => p.status !== 'Draft' && p.status !== 'Unpublished' && p.status !== 'Deleted'
        );
      }
    } else {
      projects = (store.projects || []).filter(
        (p: any) => p.status !== 'Draft' && p.status !== 'Unpublished' && p.status !== 'Deleted'
      ).sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    const sanitized = projects.map((p: any) => ({
      ...p,
      gallery_images: parseJsonField(p.gallery_images, []),
      highlights: parseJsonField(p.highlights, []),
      amenities: parseJsonField(p.amenities, []),
      nearby_landmarks: parseJsonField(p.nearby_landmarks, [])
    }));

    res.json({
      success: true,
      count: sanitized.length,
      data: sanitized
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: err.message });
  }
}

export async function getPublicProjectBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;

  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    let project: any = null;

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query(
          `SELECT id, name, slug, tagline, description, location_area, location_city,
                  total_extent_acres, total_plots_count, available_plots_count, plot_size_range,
                  status, is_featured, banner_image, video_url, brochure_url,
                  google_maps_embed_url, dtcp_number, rera_number, gallery_images,
                  highlights, amenities, nearby_landmarks, latitude, longitude, created_at, updated_at
           FROM projects WHERE slug = $1 AND status NOT IN ('Draft', 'Unpublished', 'Deleted');`,
          [slug]
        );
        project = pgRes.rows.length > 0 ? pgRes.rows[0] : null;
      } catch (err: any) {
        console.error('getPublicProjectBySlug PG Error:', err.message);
      }
    } else {
      const store = db.getFallbackData();
      project = (store.projects || []).find(
        (p: any) => p.slug === slug && p.status !== 'Draft' && p.status !== 'Unpublished' && p.status !== 'Deleted'
      );
    }

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Fetch associated plots with PRICES STRIPPED OUT for public security
    let plots: any[] = [];
    if (db.isPostgres()) {
      try {
        const plotsRes = await db.query(
          `SELECT id, project_id, plot_number, dimension_str, dimension, area_sqft,
                  facing, status, approval_status, description, primary_image_url,
                  gallery_images, video_url, video_urls, latitude, longitude, created_at
           FROM plots
           WHERE project_id = $1 AND (listing_visibility IS NULL OR listing_visibility != 'Private CRM Only')
           ORDER BY plot_number ASC;`,
          [project.id]
        );
        plots = plotsRes.rows || [];
      } catch (err: any) {
        console.error('getPublicProjectBySlug Plots PG Error:', err.message);
      }
    } else {
      const store = db.getFallbackData();
      plots = (store.plots || [])
        .filter((p: any) => p.project_id === project.id && p.listing_visibility !== 'Private CRM Only');
    }

    const sanitizedPlots = plots.map((p: any) => ({
      id: p.id,
      project_id: p.project_id,
      plot_number: p.plot_number,
      dimension_str: p.dimension_str || p.dimension,
      dimension: p.dimension || p.dimension_str,
      area_sqft: p.area_sqft,
      facing: p.facing,
      status: p.status,
      approval_status: p.approval_status || 'DTCP Approved',
      description: p.description || '',
      primary_image_url: p.primary_image_url || null,
      gallery_images: parseJsonField(p.gallery_images, []),
      video_url: p.video_url || '',
      video_urls: parseJsonField(p.video_urls, p.video_url ? [p.video_url] : []),
      latitude: p.latitude || '',
      longitude: p.longitude || ''
      // STRICT RULE: No confidential CRM plot price or staff notes are exposed!
    }));

    const formattedProject = {
      ...project,
      gallery_images: parseJsonField(project.gallery_images, []),
      highlights: parseJsonField(project.highlights, []),
      amenities: parseJsonField(project.amenities, []),
      nearby_landmarks: parseJsonField(project.nearby_landmarks, []),
      plots: sanitizedPlots
    };

    res.json({
      success: true,
      data: formattedProject
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch project details', error: err.message });
  }
}

export async function getAllProjectsAdmin(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let projects = store.projects || [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM projects ORDER BY created_at DESC;');
        projects = pgRes.rows || [];
        const pgIds = new Set(projects.map((p: any) => p.id));
        for (const fbProj of store.projects || []) {
          if (!pgIds.has(fbProj.id)) {
            projects.push(fbProj);
          }
        }
      } catch (err: any) {
        console.error('getAllProjectsAdmin PG Error:', err.message);
        projects = store.projects || [];
      }
    } else {
      projects = store.projects || [];
    }

    const parsed = projects.map((p: any) => ({
      ...p,
      gallery_images: parseJsonField(p.gallery_images, []),
      highlights: parseJsonField(p.highlights, []),
      amenities: parseJsonField(p.amenities, []),
      nearby_landmarks: parseJsonField(p.nearby_landmarks, [])
    }));

    res.json({
      success: true,
      count: parsed.length,
      data: parsed
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin projects', error: err.message });
  }
}

export async function getProjectByIdAdmin(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const store = db.getFallbackData();
    let project: any = null;

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM projects WHERE id = $1 OR slug = $1;', [id]);
        project = pgRes.rows.length > 0 ? pgRes.rows[0] : null;
      } catch (err: any) {
        console.error('getProjectByIdAdmin PG Error:', err.message);
      }
    }

    const fbProject = (store.projects || []).find((p: any) => p.id === id || p.slug === id);
    if (!project) {
      project = fbProject;
    } else if (fbProject && new Date(fbProject.updated_at || 0).getTime() > new Date(project.updated_at || 0).getTime()) {
      project = { ...project, ...fbProject };
    }

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Fetch all plots associated with this project (including price for CRM Admin)
    let plots: any[] = [];
    if (db.isPostgres()) {
      try {
        const plotsRes = await db.query(
          'SELECT * FROM plots WHERE project_id = $1 ORDER BY plot_number ASC;',
          [project.id]
        );
        plots = plotsRes.rows;
      } catch (err: any) {
        console.error('getProjectByIdAdmin plots PG Error:', err.message);
      }
    }

    if (plots.length === 0) {
      plots = (store.plots || []).filter((pl: any) => pl.project_id === project.id);
    }

    const formatted = {
      ...project,
      gallery_images: parseJsonField(project.gallery_images, []),
      highlights: parseJsonField(project.highlights, []),
      amenities: parseJsonField(project.amenities, []),
      nearby_landmarks: parseJsonField(project.nearby_landmarks, []),
      plots: plots.map((pl: any) => ({
        ...pl,
        dimension: pl.dimension || pl.dimension_str,
        dimension_str: pl.dimension_str || pl.dimension,
        gallery_images: parseJsonField(pl.gallery_images, [])
      }))
    };

    res.json({
      success: true,
      data: formatted
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch project details', error: err.message });
  }
}

export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      slug: customSlug,
      meta_title,
      meta_description,
      tagline,
      description,
      location_area,
      location_city,
      total_extent_acres,
      total_acres,
      total_plots_count,
      total_plots,
      available_plots_count,
      available_plots,
      plot_size_range,
      price_range,
      status,
      is_featured,
      banner_image,
      hero_image,
      video_url,
      brochure_url,
      google_maps_embed_url,
      map_url,
      dtcp_number,
      rera_number,
      gallery_images,
      highlights,
      amenities,
      nearby_landmarks,
      latitude,
      longitude
    } = req.body;

    if (!name || !location_area) {
      res.status(400).json({ success: false, message: 'Project name and location are required' });
      return;
    }

    const store = db.getFallbackData();
    let slug = customSlug && customSlug.trim() !== '' ? slugify(customSlug) : slugify(name);
    let counter = 1;
    while ((store.projects || []).some((p: any) => p.slug === slug)) {
      slug = `${customSlug && customSlug.trim() !== '' ? slugify(customSlug) : slugify(name)}-${counter++}`;
    }

    const resolvedAcres = Number(total_extent_acres !== undefined ? total_extent_acres : total_acres) || 0;
    const resolvedPlotsCount = Number(total_plots_count !== undefined ? total_plots_count : total_plots) || 0;
    const resolvedAvailablePlots = Number(available_plots_count !== undefined ? available_plots_count : available_plots) || 0;
    const resolvedBanner = banner_image || hero_image || '/images/hero-bg.jpg';
    const resolvedMap = google_maps_embed_url || map_url || '';
    const resolvedMetaTitle = meta_title && meta_title.trim() !== '' ? meta_title.trim() : (name || '').slice(0, 50);
    const resolvedMetaDescription = meta_description && meta_description.trim() !== '' ? meta_description.trim() : (description || tagline || '').slice(0, 150);

    const newProject = {
      id: uuidv4(),
      name,
      slug,
      meta_title: resolvedMetaTitle,
      meta_description: resolvedMetaDescription,
      tagline: tagline || '',
      description: description || '',
      location_area,
      location_city: location_city || 'Trichy',
      total_extent_acres: resolvedAcres,
      total_plots_count: resolvedPlotsCount,
      available_plots_count: resolvedAvailablePlots,
      plot_size_range: plot_size_range || '1200 - 2400 Sq.Ft',
      price_range: price_range || 'Contact for Price',
      status: status || 'Ongoing',
      is_featured: Boolean(is_featured),
      banner_image: resolvedBanner,
      video_url: video_url || '',
      brochure_url: brochure_url || '',
      google_maps_embed_url: resolvedMap,
      dtcp_number: dtcp_number || '',
      rera_number: rera_number || '',
      gallery_images: parseJsonField(gallery_images, []),
      highlights: parseJsonField(highlights, []),
      amenities: parseJsonField(amenities, []),
      nearby_landmarks: parseJsonField(nearby_landmarks, []),
      latitude: latitude || '',
      longitude: longitude || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO projects (
            id, name, slug, tagline, description, location_area, location_city,
            total_extent_acres, total_plots_count, available_plots_count, plot_size_range,
            price_range, status, is_featured, banner_image, video_url, brochure_url,
            google_maps_embed_url, dtcp_number, rera_number, meta_title, meta_description,
            gallery_images, highlights, amenities, nearby_landmarks, latitude, longitude
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23::jsonb, $24::jsonb, $25::jsonb, $26::jsonb, $27, $28
          );`,
          [
            newProject.id, newProject.name, newProject.slug, newProject.tagline, newProject.description,
            newProject.location_area, newProject.location_city, newProject.total_extent_acres,
            newProject.total_plots_count, newProject.available_plots_count, newProject.plot_size_range,
            newProject.price_range, newProject.status, newProject.is_featured, newProject.banner_image,
            newProject.video_url, newProject.brochure_url, newProject.google_maps_embed_url,
            newProject.dtcp_number, newProject.rera_number, newProject.meta_title, newProject.meta_description,
            JSON.stringify(newProject.gallery_images), JSON.stringify(newProject.highlights),
            JSON.stringify(newProject.amenities), JSON.stringify(newProject.nearby_landmarks),
            newProject.latitude, newProject.longitude
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Project INSERT error:', pgErr.message);
      }
    }

    if (!store.projects) store.projects = [];
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
    const index = (store.projects || []).findIndex((p: any) => p.id === id || p.slug === id);

    let current = index !== -1 ? store.projects[index] : null;

    if (!current && db.isPostgres()) {
      const pgGet = await db.query('SELECT * FROM projects WHERE id = $1 OR slug = $1;', [id]);
      if (pgGet.rows.length > 0) current = pgGet.rows[0];
    }

    if (!current) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const {
      name,
      slug: customSlug,
      meta_title,
      meta_description,
      tagline,
      description,
      location_area,
      location_city,
      total_extent_acres,
      total_acres,
      total_plots_count,
      total_plots,
      available_plots_count,
      available_plots,
      plot_size_range,
      price_range,
      status,
      is_featured,
      banner_image,
      hero_image,
      video_url,
      brochure_url,
      google_maps_embed_url,
      map_url,
      dtcp_number,
      rera_number,
      gallery_images,
      highlights,
      amenities,
      nearby_landmarks,
      latitude,
      longitude
    } = req.body;

    const resolvedAcres = Number(total_extent_acres !== undefined ? total_extent_acres : (total_acres !== undefined ? total_acres : current.total_extent_acres)) || 0;
    const resolvedPlotsCount = Number(total_plots_count !== undefined ? total_plots_count : (total_plots !== undefined ? total_plots : current.total_plots_count)) || 0;
    const resolvedAvailablePlots = Number(available_plots_count !== undefined ? available_plots_count : (available_plots !== undefined ? available_plots : current.available_plots_count)) || 0;
    const resolvedBanner = banner_image || hero_image || current.banner_image;
    const resolvedMap = google_maps_embed_url !== undefined ? google_maps_embed_url : (map_url !== undefined ? map_url : current.google_maps_embed_url);

    const updated = {
      ...current,
      name: name !== undefined ? name : current.name,
      slug: customSlug !== undefined && customSlug.trim() !== '' ? slugify(customSlug) : (name && name !== current.name ? slugify(name) : current.slug),
      meta_title: meta_title !== undefined ? meta_title.trim() : (current.meta_title || (name ? name.slice(0, 50) : '')),
      meta_description: meta_description !== undefined ? meta_description.trim() : (current.meta_description || ((description || tagline || current.description || '').slice(0, 150))),
      tagline: tagline !== undefined ? tagline : current.tagline,
      description: description !== undefined ? description : current.description,
      location_area: location_area !== undefined ? location_area : current.location_area,
      location_city: location_city !== undefined ? location_city : current.location_city,
      total_extent_acres: resolvedAcres,
      total_plots_count: resolvedPlotsCount,
      available_plots_count: resolvedAvailablePlots,
      plot_size_range: plot_size_range !== undefined ? plot_size_range : current.plot_size_range,
      price_range: price_range !== undefined ? price_range : current.price_range,
      status: status !== undefined ? status : current.status,
      is_featured: is_featured !== undefined ? Boolean(is_featured) : current.is_featured,
      banner_image: resolvedBanner,
      video_url: video_url !== undefined ? video_url : current.video_url,
      brochure_url: brochure_url !== undefined ? brochure_url : current.brochure_url,
      google_maps_embed_url: resolvedMap,
      dtcp_number: dtcp_number !== undefined ? dtcp_number : current.dtcp_number,
      rera_number: rera_number !== undefined ? rera_number : current.rera_number,
      gallery_images: gallery_images !== undefined ? parseJsonField(gallery_images, []) : parseJsonField(current.gallery_images, []),
      highlights: highlights !== undefined ? parseJsonField(highlights, []) : parseJsonField(current.highlights, []),
      amenities: amenities !== undefined ? parseJsonField(amenities, []) : parseJsonField(current.amenities, []),
      nearby_landmarks: nearby_landmarks !== undefined ? parseJsonField(nearby_landmarks, []) : parseJsonField(current.nearby_landmarks, []),
      latitude: latitude !== undefined ? latitude : (current.latitude || ''),
      longitude: longitude !== undefined ? longitude : (current.longitude || ''),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE projects SET
            name = $1, slug = $2, tagline = $3, description = $4, location_area = $5,
            location_city = $6, total_extent_acres = $7, total_plots_count = $8,
            available_plots_count = $9, plot_size_range = $10, price_range = $11,
            status = $12, is_featured = $13, banner_image = $14, video_url = $15,
            brochure_url = $16, google_maps_embed_url = $17, dtcp_number = $18,
            rera_number = $19, meta_title = $20, meta_description = $21,
            gallery_images = $22::jsonb, highlights = $23::jsonb, amenities = $24::jsonb,
            nearby_landmarks = $25::jsonb, latitude = $26, longitude = $27, updated_at = CURRENT_TIMESTAMP
           WHERE id = $28 OR slug = $28;`,
          [
            updated.name, updated.slug, updated.tagline, updated.description, updated.location_area,
            updated.location_city, updated.total_extent_acres, updated.total_plots_count,
            updated.available_plots_count, updated.plot_size_range, updated.price_range,
            updated.status, updated.is_featured, updated.banner_image, updated.video_url,
            updated.brochure_url, updated.google_maps_embed_url, updated.dtcp_number,
            updated.rera_number, updated.meta_title, updated.meta_description,
            JSON.stringify(updated.gallery_images),
            JSON.stringify(updated.highlights), JSON.stringify(updated.amenities),
            JSON.stringify(updated.nearby_landmarks), updated.latitude, updated.longitude, current ? current.id : id
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Project UPDATE error:', pgErr.message);
      }
    }

    const realIdx = (store.projects || []).findIndex((p: any) => p.id === updated.id || (current && p.id === current.id));
    if (realIdx !== -1) {
      store.projects[realIdx] = updated;
    } else {
      if (!store.projects) store.projects = [];
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

    store.projects = (store.projects || []).filter((p: any) => p.id !== id);
    store.plots = (store.plots || []).filter((p: any) => p.project_id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: err.message });
  }
}
