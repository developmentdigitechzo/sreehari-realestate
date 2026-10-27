import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

function parseJsonField(val: any, fallback: any = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export async function getPublicPlotsByProjectSlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;

  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    let projectId: string | null = null;
    let fallbackProj: any = null;

    if (db.isPostgres()) {
      try {
        const pRes = await db.query('SELECT id FROM projects WHERE slug = $1;', [slug]);
        if (pRes.rows.length > 0) projectId = pRes.rows[0].id;
      } catch (err: any) {
        console.error('getPublicPlotsByProjectSlug project lookup error:', err.message);
      }
    } else {
      const store = db.getFallbackData();
      fallbackProj = (store.projects || []).find((p: any) => p.slug === slug);
      if (fallbackProj) projectId = fallbackProj.id;
    }

    if (!projectId) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    let plots: any[] = [];
    if (db.isPostgres()) {
      try {
        const pgRes = await db.query(
          `SELECT id, project_id, plot_number, dimension_str, dimension, area_sqft,
                  facing, approval_status, status, description, primary_image_url,
                  gallery_images, video_url, video_urls, latitude, longitude, created_at
           FROM plots
           WHERE project_id = $1 AND (listing_visibility IS NULL OR listing_visibility != 'Private CRM Only')
           ORDER BY plot_number ASC;`,
          [projectId]
        );
        plots = pgRes.rows || [];
      } catch (err: any) {
        console.error('getPublicPlotsByProjectSlug plots lookup error:', err.message);
      }
    } else {
      const store = db.getFallbackData();
      plots = (store.plots || []).filter(
        (p: any) => p.project_id === projectId && p.listing_visibility !== 'Private CRM Only'
      );
    }

    const sanitizedPlots = plots.map((p: any) => ({
      id: p.id,
      project_id: p.project_id,
      plot_number: p.plot_number,
      dimension_str: p.dimension_str || p.dimension,
      dimension: p.dimension || p.dimension_str,
      area_sqft: p.area_sqft,
      facing: p.facing,
      approval_status: p.approval_status || 'DTCP Approved',
      status: p.status,
      description: p.description || '',
      primary_image_url: p.primary_image_url || null,
      gallery_images: parseJsonField(p.gallery_images, []),
      video_url: p.video_url || '',
      video_urls: parseJsonField(p.video_urls, p.video_url ? [p.video_url] : []),
      latitude: p.latitude || '',
      longitude: p.longitude || ''
    }));

    res.json({
      success: true,
      count: sanitizedPlots.length,
      data: sanitizedPlots
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch public plots', error: err.message });
  }
}

// Public: Get plots for a project by projectId (with prices redacted)
export async function getPublicPlotsByProjectId(req: Request, res: Response): Promise<void> {
  const { projectId } = req.params;

  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    let plots: any[] = [];
    if (db.isPostgres()) {
      try {
        const pgRes = await db.query(
          `SELECT id, project_id, plot_number, dimension_str, dimension, area_sqft,
                  facing, approval_status, status, description, primary_image_url,
                  gallery_images, video_url, video_urls, latitude, longitude, created_at
           FROM plots
           WHERE project_id = $1 AND (listing_visibility IS NULL OR listing_visibility != 'Private CRM Only')
           ORDER BY plot_number ASC;`,
          [projectId]
        );
        plots = pgRes.rows || [];
      } catch (err: any) {
        console.error('getPublicPlotsByProjectId PG Error:', err.message);
      }
    } else {
      const store = db.getFallbackData();
      plots = (store.plots || []).filter(
        (p: any) => p.project_id === projectId && p.listing_visibility !== 'Private CRM Only'
      );
    }

    const sanitizedPlots = plots.map((p: any) => ({
      id: p.id,
      project_id: p.project_id,
      plot_number: p.plot_number,
      dimension_str: p.dimension_str || p.dimension,
      dimension: p.dimension || p.dimension_str,
      area_sqft: p.area_sqft,
      facing: p.facing,
      approval_status: p.approval_status || 'DTCP Approved',
      status: p.status,
      description: p.description || '',
      primary_image_url: p.primary_image_url || null,
      gallery_images: parseJsonField(p.gallery_images, []),
      video_url: p.video_url || '',
      video_urls: parseJsonField(p.video_urls, p.video_url ? [p.video_url] : []),
      latitude: p.latitude || '',
      longitude: p.longitude || ''
    }));

    res.json({
      success: true,
      count: sanitizedPlots.length,
      data: sanitizedPlots
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch public plots', error: err.message });
  }
}

// Admin: Get all plots with full project join and price details
export async function getAllPlotsAdmin(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let plots = store.plots || [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query(
          `SELECT plots.*, projects.name as project_name
           FROM plots
           LEFT JOIN projects ON plots.project_id = projects.id
           ORDER BY plots.created_at DESC;`
        );
        plots = pgRes.rows || [];
      } catch (err: any) {
        console.error('getAllPlotsAdmin PG Error:', err.message);
      }
    }

    const enrichedPlots = plots.map((plot: any) => {
      const proj = (store.projects || []).find((p: any) => p.id === plot.project_id);
      return {
        ...plot,
        dimension: plot.dimension || plot.dimension_str,
        dimension_str: plot.dimension_str || plot.dimension,
        project_name: plot.project_name || (proj ? proj.name : 'Township Project'),
        gallery_images: parseJsonField(plot.gallery_images, []),
        video_urls: parseJsonField(plot.video_urls, plot.video_url ? [plot.video_url] : [])
      };
    });

    res.json({
      success: true,
      count: enrichedPlots.length,
      data: enrichedPlots
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch all plots', error: err.message });
  }
}

export async function createPlot(req: Request, res: Response): Promise<void> {
  try {
    const {
      project_id,
      title,
      slug,
      type,
      category,
      locality,
      road_corridor,
      taluk,
      district,
      plot_number,
      length_ft,
      width_ft,
      dimension_str,
      dimension,
      area_sqft,
      facing,
      approval_status,
      price_per_sqft,
      total_price_lakhs,
      price,
      currency,
      status,
      listing_visibility,
      amenities,
      description,
      meta_title,
      meta_description,
      video_url,
      video_urls,
      latitude,
      longitude,
      primary_image_url,
      gallery_images
    } = req.body;

    if (!project_id || (!plot_number && !title)) {
      res.status(400).json({ success: false, message: 'Project ID and Plot number or Title are required' });
      return;
    }

    const store = db.getFallbackData();

    // Resolve project_id to canonical PostgreSQL projects(id) to ensure foreign key safety
    let resolvedProjectId = project_id;
    if (db.isPostgres()) {
      try {
        const cleanProjKey = (project_id || '').toLowerCase().replace(/\s+/g, '-');
        const pCheck = await db.query(
          'SELECT id FROM projects WHERE id = $1 OR slug = $1 OR slug = $2 OR name ILIKE $1 LIMIT 1;',
          [project_id, cleanProjKey]
        );
        if (pCheck.rows && pCheck.rows.length > 0) {
          resolvedProjectId = pCheck.rows[0].id;
        }
      } catch (err: any) {
        console.warn('Project ID resolution note:', err.message);
      }
    }

    let plotId = req.body.id;
    if (!plotId) {
      plotId = `plot-${uuidv4().substring(0, 8)}`;
    }

    const cleanPlotNumber = (plot_number || '').replace(/^plot\s*#?/gi, '').trim();
    const formattedPlotNum = cleanPlotNumber ? `Plot #${cleanPlotNumber}` : (title || 'Plot Entry');
    const computedSlug = slug || `property-${plotId}`;
    const resolvedDimension = dimension_str || dimension || (length_ft && width_ft ? `${length_ft} x ${width_ft} Ft` : '');
    const parsedVideoUrls = parseJsonField(video_urls, video_url ? [video_url] : []);
    const primaryVideoUrl = video_url || (parsedVideoUrls.length > 0 ? parsedVideoUrls[0] : '');

    const newPlot = {
      id: plotId,
      project_id: resolvedProjectId,
      title: title !== undefined ? title.trim() : '',
      slug: computedSlug,
      type: type || 'Plot',
      category: category || 'Sale',
      locality: locality || '',
      road_corridor: road_corridor || '',
      taluk: taluk || '',
      district: district || '',
      plot_number: plot_number || formattedPlotNum,
      length_ft: length_ft !== undefined && length_ft !== '' ? Number(length_ft) : 0,
      width_ft: width_ft !== undefined && width_ft !== '' ? Number(width_ft) : 0,
      dimension_str: resolvedDimension,
      dimension: resolvedDimension,
      area_sqft: area_sqft !== undefined && area_sqft !== '' ? Number(area_sqft) : 0,
      facing: facing || 'North',
      approval_status: approval_status || 'DTCP Approved',
      price_per_sqft: price_per_sqft !== undefined && price_per_sqft !== '' ? Number(price_per_sqft) : 0,
      total_price_lakhs: total_price_lakhs !== undefined && total_price_lakhs !== '' ? Number(total_price_lakhs) : (price ? Number(price) / 100000 : 0),
      price: price !== undefined && price !== '' ? Number(price) : (total_price_lakhs ? Number(total_price_lakhs) * 100000 : 0),
      currency: currency || 'INR',
      status: status || 'Available',
      listing_visibility: listing_visibility || 'Publish to Website & CRM',
      amenities: amenities || '',
      description: description || '',
      meta_title: meta_title || title || '',
      meta_description: meta_description || description || '',
      video_url: primaryVideoUrl,
      video_urls: parsedVideoUrls,
      latitude: latitude || '',
      longitude: longitude || '',
      primary_image_url: primary_image_url || null,
      gallery_images: parseJsonField(gallery_images, []),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO plots (
            id, project_id, title, slug, type, category, locality, road_corridor, taluk, district,
            plot_number, length_ft, width_ft, dimension_str, dimension, area_sqft, facing, approval_status,
            price_per_sqft, total_price_lakhs, price, currency, status, listing_visibility,
            amenities, description, meta_title, meta_description, video_url, latitude, longitude,
            primary_image_url, gallery_images, video_urls
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18,
            $19, $20, $21, $22, $23, $24,
            $25, $26, $27, $28, $29, $30, $31,
            $32, $33::jsonb, $34::jsonb
          );`,
          [
            newPlot.id, newPlot.project_id, newPlot.title, newPlot.slug, newPlot.type, newPlot.category,
            newPlot.locality, newPlot.road_corridor, newPlot.taluk, newPlot.district,
            newPlot.plot_number, newPlot.length_ft, newPlot.width_ft, newPlot.dimension_str, newPlot.dimension,
            newPlot.area_sqft, newPlot.facing, newPlot.approval_status,
            newPlot.price_per_sqft, newPlot.total_price_lakhs, newPlot.price, newPlot.currency, newPlot.status,
            newPlot.listing_visibility, newPlot.amenities, newPlot.description, newPlot.meta_title,
            newPlot.meta_description, newPlot.video_url, newPlot.latitude, newPlot.longitude,
            newPlot.primary_image_url, JSON.stringify(newPlot.gallery_images), JSON.stringify(newPlot.video_urls)
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Plot INSERT error:', pgErr.message);
      }
    }

    if (!store.plots) store.plots = [];
    store.plots.push(newPlot);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Plot added successfully',
      data: newPlot
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add plot', error: err.message });
  }
}

export async function updatePlot(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    const index = (store.plots || []).findIndex((p: any) => p.id === id);

    let current = index !== -1 ? store.plots[index] : null;

    if (!current && db.isPostgres()) {
      const pgGet = await db.query('SELECT * FROM plots WHERE id = $1;', [id]);
      if (pgGet.rows.length > 0) current = pgGet.rows[0];
    }

    if (!current) {
      res.status(404).json({ success: false, message: 'Plot not found' });
      return;
    }

    const {
      title, slug, type, category, locality, road_corridor, taluk, district,
      plot_number, length_ft, width_ft, dimension_str, dimension, area_sqft, facing, approval_status,
      price_per_sqft, total_price_lakhs, price, currency, status, listing_visibility,
      amenities, description, meta_title, meta_description, video_url, video_urls, latitude, longitude,
      primary_image_url, gallery_images
    } = req.body;

    const resolvedDimension = dimension_str !== undefined ? dimension_str : (dimension !== undefined ? dimension : current.dimension_str);
    const parsedVideoUrls = video_urls !== undefined
      ? parseJsonField(video_urls, [])
      : parseJsonField(current.video_urls, current.video_url ? [current.video_url] : []);
    const primaryVideo = video_url !== undefined
      ? video_url
      : (parsedVideoUrls.length > 0 ? parsedVideoUrls[0] : (current.video_url || ''));

    const updated = {
      ...current,
      title: title !== undefined ? title.trim() : (current.title || ''),
      slug: slug !== undefined ? slug : current.slug,
      type: type !== undefined ? type : current.type,
      category: category !== undefined ? category : current.category,
      locality: locality !== undefined ? locality : current.locality,
      road_corridor: road_corridor !== undefined ? road_corridor : current.road_corridor,
      taluk: taluk !== undefined ? taluk : current.taluk,
      district: district !== undefined ? district : current.district,
      plot_number: plot_number !== undefined ? plot_number : current.plot_number,
      length_ft: length_ft !== undefined ? Number(length_ft) : current.length_ft,
      width_ft: width_ft !== undefined ? Number(width_ft) : current.width_ft,
      dimension_str: resolvedDimension,
      dimension: resolvedDimension,
      area_sqft: area_sqft !== undefined ? Number(area_sqft) : current.area_sqft,
      facing: facing !== undefined ? facing : current.facing,
      approval_status: approval_status !== undefined ? approval_status : current.approval_status,
      price_per_sqft: price_per_sqft !== undefined ? Number(price_per_sqft) : current.price_per_sqft,
      total_price_lakhs: total_price_lakhs !== undefined ? Number(total_price_lakhs) : current.total_price_lakhs,
      price: price !== undefined ? Number(price) : current.price,
      currency: currency !== undefined ? currency : current.currency,
      status: status !== undefined ? status : current.status,
      listing_visibility: listing_visibility !== undefined ? listing_visibility : current.listing_visibility,
      amenities: amenities !== undefined ? amenities : current.amenities,
      description: description !== undefined ? description : current.description,
      meta_title: meta_title !== undefined ? meta_title : current.meta_title,
      meta_description: meta_description !== undefined ? meta_description : current.meta_description,
      video_url: primaryVideo,
      video_urls: parsedVideoUrls,
      latitude: latitude !== undefined ? latitude : current.latitude,
      longitude: longitude !== undefined ? longitude : current.longitude,
      primary_image_url: primary_image_url !== undefined ? primary_image_url : current.primary_image_url,
      gallery_images: gallery_images !== undefined ? parseJsonField(gallery_images, []) : parseJsonField(current.gallery_images, []),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE plots SET
            title=$1, slug=$2, type=$3, category=$4, locality=$5, road_corridor=$6, taluk=$7, district=$8,
            plot_number=$9, length_ft=$10, width_ft=$11, dimension_str=$12, dimension=$13, area_sqft=$14, facing=$15, approval_status=$16,
            price_per_sqft=$17, total_price_lakhs=$18, price=$19, currency=$20, status=$21, listing_visibility=$22,
            amenities=$23, description=$24, meta_title=$25, meta_description=$26, video_url=$27, latitude=$28, longitude=$29,
            primary_image_url=$30, gallery_images=$31::jsonb, video_urls=$32::jsonb, updated_at=CURRENT_TIMESTAMP
          WHERE id=$33;`,
          [
            updated.title || '', updated.slug || '', updated.type || 'Plot', updated.category || 'Sale',
            updated.locality || '', updated.road_corridor || '', updated.taluk || '', updated.district || '',
            updated.plot_number || '', updated.length_ft || 0, updated.width_ft || 0, updated.dimension_str || '',
            updated.dimension || '', updated.area_sqft || 0, updated.facing || 'North', updated.approval_status || '',
            updated.price_per_sqft || 0, updated.total_price_lakhs || 0, updated.price || 0, updated.currency || 'INR',
            updated.status || 'Available', updated.listing_visibility || '', updated.amenities || '',
            updated.description || '', updated.meta_title || '', updated.meta_description || '',
            updated.video_url || '', updated.latitude || '', updated.longitude || '',
            updated.primary_image_url || '', JSON.stringify(updated.gallery_images || []),
            JSON.stringify(updated.video_urls || []), id
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Plot UPDATE error:', pgErr.message);
      }
    }

    if (index !== -1) {
      store.plots[index] = updated;
    } else {
      if (!store.plots) store.plots = [];
      store.plots.push(updated);
    }
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Plot updated successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update plot', error: err.message });
  }
}

export async function deletePlot(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();

    if (db.isPostgres()) {
      try {
        await db.query('DELETE FROM plots WHERE id = $1;', [id]);
      } catch (pgErr: any) {
        console.error('PostgreSQL Plot DELETE error:', pgErr.message);
      }
    }

    store.plots = (store.plots || []).filter((p: any) => p.id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Plot deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete plot', error: err.message });
  }
}
