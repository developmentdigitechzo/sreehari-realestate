import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export interface SiteVisitRecord {
  id: string;
  lead_id?: string | null;
  project_id?: string | null;
  project_name?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  visit_date: string;
  visit_time?: string;
  preferred_plot_size?: string;
  pickup_needed?: boolean;
  pickup_location?: string;
  status: 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
  assigned_staff?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// 1. Get All Site Visits (with filters)
export async function getAllSiteVisits(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let visits: any[] = store.site_visits || [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM site_visits ORDER BY created_at DESC;');
        if (pgRes.rows.length > 0) visits = pgRes.rows;
      } catch (err: any) {
        console.error('PostgreSQL site_visits SELECT error:', err.message);
      }
    }

    const { status, projectId, search } = req.query;

    if (status && typeof status === 'string' && status !== 'All') {
      visits = visits.filter(v => (v.status || '').toLowerCase() === status.toLowerCase());
    }

    if (projectId && typeof projectId === 'string' && projectId !== 'All') {
      visits = visits.filter(v => v.project_id === projectId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      visits = visits.filter(v =>
        (v.customer_name && v.customer_name.toLowerCase().includes(q)) ||
        (v.customer_phone && v.customer_phone.includes(q)) ||
        (v.project_name && v.project_name.toLowerCase().includes(q)) ||
        (v.pickup_location && v.pickup_location.toLowerCase().includes(q))
      );
    }

    visits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Enrich with project details if missing
    const enrichedVisits = visits.map(v => {
      const proj = (store.projects || []).find((p: any) => p.id === v.project_id);
      return {
        ...v,
        project_name: v.project_name || (proj ? proj.name : 'Park Avenue Plotted Layout'),
        assigned_staff: v.assigned_staff || 'Sales Team',
        status: v.status || 'Requested',
        visit_time: v.visit_time || '10:00 AM'
      };
    });

    res.json({
      success: true,
      count: enrichedVisits.length,
      data: enrichedVisits
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch site visits', error: err.message });
  }
}

// 2. Create Site Visit (Public Website Booking Form or Admin Manual Entry)
export async function createSiteVisit(req: Request, res: Response): Promise<void> {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      project_id,
      project_name,
      visit_date,
      visit_time,
      preferred_plot_size,
      pickup_needed,
      pickup_location,
      notes,
      assigned_staff,
      source
    } = req.body;

    if (!customer_name || !customer_phone || !visit_date) {
      res.status(400).json({
        success: false,
        message: 'Customer name, phone number, and visit date are required'
      });
      return;
    }

    const store = db.getFallbackData();
    if (!store.site_visits) store.site_visits = [];
    if (!store.leads) store.leads = [];

    // Find or create matching CRM lead
    let lead = store.leads.find((l: any) => l.phone === customer_phone.trim());
    const leadId = lead ? lead.id : uuidv4();

    const proj = (store.projects || []).find((p: any) => p.id === project_id);
    const resolvedProjName = project_name || (proj ? proj.name : 'Park Avenue Plotted Layout');

    if (!lead) {
      lead = {
        id: leadId,
        project_id: project_id || null,
        name: customer_name.trim(),
        phone: customer_phone.trim(),
        email: customer_email ? customer_email.trim() : '',
        preferred_plot_size: preferred_plot_size || '',
        message: `Booked Site Visit for ${visit_date} at ${visit_time || '10:00 AM'}`,
        source: source || 'Website Form',
        stage: 'Site Visit Scheduled',
        status: 'Site Visit Scheduled',
        priority: 'Hot',
        assigned_to: assigned_staff || 'Sales Team',
        site_visit_date: visit_date,
        site_visit_time: visit_time || '',
        site_visit_pickup_needed: Boolean(pickup_needed),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      store.leads.unshift(lead);
    } else {
      lead.stage = 'Site Visit Scheduled';
      lead.status = 'Site Visit Scheduled';
      lead.site_visit_date = visit_date;
      lead.site_visit_time = visit_time || '';
      lead.priority = 'Hot';
      lead.updated_at = new Date().toISOString();
    }

    const visitId = uuidv4();
    const newVisit: SiteVisitRecord = {
      id: visitId,
      lead_id: leadId,
      project_id: project_id || null,
      project_name: resolvedProjName,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email ? customer_email.trim() : '',
      visit_date,
      visit_time: visit_time || '10:00 AM',
      preferred_plot_size: preferred_plot_size || '',
      pickup_needed: Boolean(pickup_needed),
      pickup_location: pickup_location || '',
      status: 'Requested',
      assigned_staff: assigned_staff || 'Sales Team',
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO site_visits (
            id, lead_id, project_id, project_name, customer_name, customer_phone, customer_email, visit_date, visit_time, preferred_plot_size, pickup_needed, pickup_location, status, assigned_staff, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`,
          [
            newVisit.id,
            newVisit.lead_id,
            newVisit.project_id,
            newVisit.project_name,
            newVisit.customer_name,
            newVisit.customer_phone,
            newVisit.customer_email,
            newVisit.visit_date,
            newVisit.visit_time,
            newVisit.preferred_plot_size,
            newVisit.pickup_needed,
            newVisit.pickup_location,
            newVisit.status,
            newVisit.assigned_staff,
            newVisit.notes
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL site_visit INSERT error:', pgErr.message);
      }
    }

    store.site_visits.unshift(newVisit);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Site visit booked successfully',
      data: newVisit
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to book site visit', error: err.message });
  }
}

// 3. Update Site Visit Status & Assignment
export async function updateSiteVisit(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    if (!store.site_visits) store.site_visits = [];
    const index = store.site_visits.findIndex((v: any) => v.id === id);

    const current = index !== -1 ? store.site_visits[index] : {};
    const updated = {
      ...current,
      ...req.body,
      id,
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE site_visits SET
            visit_date=$1, visit_time=$2, pickup_needed=$3, pickup_location=$4, status=$5, assigned_staff=$6, notes=$7, updated_at=CURRENT_TIMESTAMP
          WHERE id=$8;`,
          [
            updated.visit_date || current.visit_date || '',
            updated.visit_time || current.visit_time || '10:00 AM',
            Boolean(updated.pickup_needed),
            updated.pickup_location || '',
            updated.status || 'Requested',
            updated.assigned_staff || 'Sales Team',
            updated.notes || '',
            id
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL site_visit UPDATE error:', pgErr.message);
      }
    }

    if (index !== -1) {
      store.site_visits[index] = updated;
    } else {
      store.site_visits.push(updated);
    }
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Site visit updated successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update site visit', error: err.message });
  }
}

// 4. Delete Site Visit
export async function deleteSiteVisit(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    if (!store.site_visits) store.site_visits = [];

    if (db.isPostgres()) {
      try {
        await db.query('DELETE FROM site_visits WHERE id = $1;', [id]);
      } catch (pgErr: any) {
        console.error('PostgreSQL site_visit DELETE error:', pgErr.message);
      }
    }

    store.site_visits = store.site_visits.filter((v: any) => v.id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Site visit deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete site visit', error: err.message });
  }
}

// 5. Get Site Visit Statistics Overview
export async function getSiteVisitStats(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let visits: any[] = store.site_visits || [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM site_visits;');
        if (pgRes.rows.length > 0) visits = pgRes.rows;
      } catch {}
    }

    const totalVisits = visits.length;
    const pendingRequests = visits.filter(v => (v.status || 'Requested') === 'Requested').length;
    const confirmedVisits = visits.filter(v => v.status === 'Confirmed').length;
    const completedVisits = visits.filter(v => v.status === 'Completed').length;
    const pickupNeededCount = visits.filter(v => Boolean(v.pickup_needed)).length;

    res.json({
      success: true,
      data: {
        totalVisits,
        pendingRequests,
        confirmedVisits,
        completedVisits,
        pickupNeededCount
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch site visit stats', error: err.message });
  }
}
