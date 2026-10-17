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

    // Resolve project_id if only project_name was passed
    let resolvedProjectId = project_id || null;
    if (!resolvedProjectId && project_name) {
      const match = (store.projects || []).find((p: any) =>
        p.name.toLowerCase() === project_name.toLowerCase() ||
        p.id.toLowerCase() === project_name.toLowerCase()
      );
      if (match) resolvedProjectId = match.id;
    }

    const proj = (store.projects || []).find((p: any) => p.id === resolvedProjectId);
    const resolvedProjName = project_name || (proj ? proj.name : 'Park Avenue');

    const digitsOnly = String(customer_phone).replace(/\D/g, '').slice(-10);

    // Find or create matching CRM lead in PostgreSQL and fallback store
    let existingLeadPg: any = null;
    if (db.isPostgres()) {
      try {
        const pgCheck = await db.query(
          `SELECT * FROM leads WHERE RIGHT(REGEXP_REPLACE(phone, '\\D', '', 'g'), 10) = $1 ORDER BY created_at DESC LIMIT 1;`,
          [digitsOnly]
        );
        if (pgCheck.rows.length > 0) existingLeadPg = pgCheck.rows[0];
      } catch (err: any) {
        console.error('PostgreSQL lead check error in createSiteVisit:', err.message);
      }
    }

    let lead = existingLeadPg || (store.leads || []).find((l: any) => {
      const pDigits = String(l.phone || '').replace(/\D/g, '').slice(-10);
      return pDigits === digitsOnly;
    });

    const leadId = lead ? lead.id : uuidv4();

    if (!lead) {
      lead = {
        id: leadId,
        project_id: resolvedProjectId,
        name: customer_name.trim(),
        phone: customer_phone.trim(),
        email: customer_email ? customer_email.trim() : '',
        preferred_plot_size: preferred_plot_size || '',
        message: `Booked Site Visit for ${visit_date} at ${visit_time || '10:00 AM'}`,
        source: source || 'CRM Site Visit Booking',
        stage: 'Site Visit Scheduled',
        status: 'Site Visit Scheduled',
        priority: 'Hot',
        assigned_to: assigned_staff || 'Sales Team',
        site_visit_date: visit_date,
        site_visit_time: visit_time || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (store.leads) store.leads.unshift(lead);
    } else {
      lead.stage = 'Site Visit Scheduled';
      lead.status = 'Site Visit Scheduled';
      lead.site_visit_date = visit_date;
      lead.site_visit_time = visit_time || '';
      lead.priority = 'Hot';
      if (resolvedProjectId) lead.project_id = resolvedProjectId;
      lead.updated_at = new Date().toISOString();
    }

    const visitId = uuidv4();
    const newVisit: SiteVisitRecord = {
      id: visitId,
      lead_id: leadId,
      project_id: resolvedProjectId,
      project_name: resolvedProjName,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email ? customer_email.trim() : '',
      visit_date,
      visit_time: visit_time || '10:00 AM',
      preferred_plot_size: preferred_plot_size || '',
      pickup_needed: false,
      pickup_location: '',
      status: 'Requested',
      assigned_staff: assigned_staff || 'Sales Team',
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        // 1. Ensure Lead exists or is updated in PostgreSQL leads table
        if (!existingLeadPg) {
          await db.query(
            `INSERT INTO leads (
              id, project_id, name, phone, email, preferred_plot_size, budget, message, source, status, stage, priority, assigned_to, site_visit_date, site_visit_time, notes, admin_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`,
            [
              leadId,
              resolvedProjectId,
              lead.name,
              lead.phone,
              lead.email,
              lead.preferred_plot_size,
              preferred_plot_size || '',
              lead.message,
              lead.source || 'CRM Site Visit Booking',
              'Site Visit Scheduled',
              'Site Visit Scheduled',
              'Hot',
              lead.assigned_to,
              visit_date,
              visit_time || '',
              '[]',
              notes || ''
            ]
          );
        } else {
          await db.query(
            `UPDATE leads SET 
              project_id = COALESCE($1, project_id),
              stage = 'Site Visit Scheduled', 
              status = 'Site Visit Scheduled', 
              priority = 'Hot', 
              site_visit_date = $2, 
              site_visit_time = $3, 
              updated_at = CURRENT_TIMESTAMP 
            WHERE id = $4;`,
            [resolvedProjectId, visit_date, visit_time || '', existingLeadPg.id]
          );
        }

        // 2. Insert into PostgreSQL site_visits table
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
        console.error('PostgreSQL site_visit / lead INSERT error:', pgErr.message);
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
            customer_name=$1, customer_phone=$2, customer_email=$3, project_id=$4, project_name=$5, preferred_plot_size=$6,
            visit_date=$7, visit_time=$8, pickup_needed=$9, pickup_location=$10, status=$11, assigned_staff=$12, notes=$13, updated_at=CURRENT_TIMESTAMP
          WHERE id=$14;`,
          [
            updated.customer_name || current.customer_name || '',
            updated.customer_phone || current.customer_phone || '',
            updated.customer_email ?? current.customer_email ?? '',
            updated.project_id ?? current.project_id ?? null,
            updated.project_name ?? current.project_name ?? '',
            updated.preferred_plot_size ?? current.preferred_plot_size ?? '',
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
