import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export async function getPlotsByProject(req: Request, res: Response): Promise<void> {
  const { projectId } = req.params;

  try {
    const store = db.getFallbackData();
    let plots = store.plots.filter((p: any) => p.project_id === projectId);

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM plots WHERE project_id = $1;', [projectId]);
        if (pgRes.rows.length > 0) plots = pgRes.rows;
      } catch {}
    }

    res.json({
      success: true,
      count: plots.length,
      data: plots
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch plots', error: err.message });
  }
}

export async function getAllPlotsAdmin(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let plots = store.plots;

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM plots ORDER BY created_at DESC;');
        if (pgRes.rows.length > 0) plots = pgRes.rows;
      } catch {}
    }

    const enrichedPlots = plots.map((plot: any) => {
      const proj = store.projects.find((p: any) => p.id === plot.project_id);
      return {
        ...plot,
        project_name: proj ? proj.name : 'Township Project'
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

    let plotId = req.body.id;
    if (!plotId) {
      let maxNum = 100;
      (store.plots || []).forEach((p: any) => {
        if (p.id) {
          const match = p.id.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      });
      plotId = `plot-${maxNum + 1}`;
    }

    const cleanPlotNumber = (plot_number || '').replace(/^plot\s*#?/gi, '').trim();
    const formattedPlotNum = cleanPlotNumber ? `Plot #${cleanPlotNumber}` : (title || 'Plot Entry');
    const computedSlug = slug || `property-${plotId}`;

    const newPlot = {
      id: plotId,
      project_id,
      title: title || formattedPlotNum,
      slug: computedSlug,
      type: type || 'Plot',
      category: category || 'Sale',
      locality: locality || '',
      road_corridor: road_corridor || '',
      taluk: taluk || '',
      district: district || '',
      plot_number: plot_number || '',
      length_ft: length_ft !== undefined && length_ft !== '' ? Number(length_ft) : 0,
      width_ft: width_ft !== undefined && width_ft !== '' ? Number(width_ft) : 0,
      dimension_str: dimension_str || (length_ft && width_ft ? `${length_ft} x ${width_ft} Ft` : ''),
      area_sqft: area_sqft !== undefined && area_sqft !== '' ? Number(area_sqft) : 0,
      facing: facing || '',
      approval_status: approval_status || '',
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
      video_url: video_url || '',
      latitude: latitude || '',
      longitude: longitude || '',
      primary_image_url: primary_image_url || '',
      gallery_images: Array.isArray(gallery_images) ? gallery_images : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO plots (
            id, project_id, title, slug, type, category, locality, road_corridor, taluk, district,
            plot_number, length_ft, width_ft, dimension_str, area_sqft, facing, approval_status,
            price_per_sqft, total_price_lakhs, price, currency, status, listing_visibility,
            amenities, description, meta_title, meta_description, video_url, latitude, longitude,
            primary_image_url, gallery_images
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17,
            $18, $19, $20, $21, $22, $23,
            $24, $25, $26, $27, $28, $29, $30,
            $31, $32
          );`,
          [
            newPlot.id, newPlot.project_id, newPlot.title, newPlot.slug, newPlot.type, newPlot.category, newPlot.locality, newPlot.road_corridor, newPlot.taluk, newPlot.district,
            newPlot.plot_number, newPlot.length_ft, newPlot.width_ft, newPlot.dimension_str, newPlot.area_sqft, newPlot.facing, newPlot.approval_status,
            newPlot.price_per_sqft, newPlot.total_price_lakhs, newPlot.price, newPlot.currency, newPlot.status, newPlot.listing_visibility,
            newPlot.amenities, newPlot.description, newPlot.meta_title, newPlot.meta_description, newPlot.video_url, newPlot.latitude, newPlot.longitude,
            newPlot.primary_image_url, JSON.stringify(newPlot.gallery_images)
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Plot INSERT error:', pgErr.message);
      }
    }

    store.plots.push(newPlot);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Property/Plot added successfully',
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
    const index = store.plots.findIndex((p: any) => p.id === id);

    const current = index !== -1 ? store.plots[index] : {};
    const updated = {
      ...current,
      ...req.body,
      id,
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE plots SET
            title=$1, slug=$2, type=$3, category=$4, locality=$5, road_corridor=$6, taluk=$7, district=$8,
            plot_number=$9, length_ft=$10, width_ft=$11, dimension_str=$12, area_sqft=$13, facing=$14, approval_status=$15,
            price_per_sqft=$16, total_price_lakhs=$17, price=$18, currency=$19, status=$20, listing_visibility=$21,
            amenities=$22, description=$23, meta_title=$24, meta_description=$25, video_url=$26, latitude=$27, longitude=$28,
            primary_image_url=$29, gallery_images=$30, updated_at=CURRENT_TIMESTAMP
          WHERE id=$31;`,
          [
            updated.title || '', updated.slug || '', updated.type || 'Plot', updated.category || 'Sale', updated.locality || '', updated.road_corridor || '', updated.taluk || '', updated.district || '',
            updated.plot_number || '', updated.length_ft || 0, updated.width_ft || 0, updated.dimension_str || '', updated.area_sqft || 0, updated.facing || 'North', updated.approval_status || '',
            updated.price_per_sqft || 0, updated.total_price_lakhs || 0, updated.price || 0, updated.currency || 'INR', updated.status || 'Available', updated.listing_visibility || '',
            updated.amenities || '', updated.description || '', updated.meta_title || '', updated.meta_description || '', updated.video_url || '', updated.latitude || '', updated.longitude || '',
            updated.primary_image_url || '', JSON.stringify(updated.gallery_images || []), id
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL Plot UPDATE error:', pgErr.message);
      }
    }

    if (index !== -1) {
      store.plots[index] = updated;
    } else {
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

    store.plots = store.plots.filter((p: any) => p.id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Plot deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete plot', error: err.message });
  }
}
