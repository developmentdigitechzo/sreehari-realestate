import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export async function submitPublicLead(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      phone,
      email,
      project_id,
      project_interest,
      plot_id,
      plot_name,
      plot_description,
      preferred_plot_size,
      preferred_budget,
      budget,
      facing_preference,
      message,
      source,
      visit_date,
      visit_time
    } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Name and Phone number are required' });
      return;
    }

    // Phone sanity check (min 10 digits)
    const digitsOnly = String(phone).replace(/\D/g, '').slice(-10);
    if (digitsOnly.length < 10) {
      res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
      return;
    }

    const store = db.getFallbackData();
    let resolvedProjectId = project_id || null;

    // Resolve project_id by project_name, project_interest, or bracketed title in message e.g. [Aishwarya Nagar]
    let projSearch = req.body.project_name || project_interest || '';
    if (!projSearch && message && typeof message === 'string') {
      const match = message.match(/\[(.*?)\]/);
      if (match && match[1]) {
        projSearch = match[1].trim();
      }
    }

    if (!resolvedProjectId && projSearch) {
      if (db.isPostgres()) {
        try {
          const pgProj = await db.query(
            'SELECT id FROM projects WHERE LOWER(name) = LOWER($1) OR id = $1 LIMIT 1',
            [projSearch.trim()]
          );
          if (pgProj.rows.length > 0) {
            resolvedProjectId = pgProj.rows[0].id;
          }
        } catch {
          // fallback to store
        }
      }
      if (!resolvedProjectId) {
        const match = store.projects?.find((p: any) =>
          p.name?.toLowerCase() === projSearch.toLowerCase() ||
          p.slug?.toLowerCase() === projSearch.toLowerCase() ||
          p.id === projSearch
        );
        if (match) {
          resolvedProjectId = match.id;
        }
      }
    }

    let resolvedBudget = budget || preferred_budget || '';
    if (!resolvedBudget && message && typeof message === 'string') {
      const bMatch = message.match(/Preferred Budget:\s*([^|]+)/i) || message.match(/Budget:\s*([^|]+)/i);
      if (bMatch && bMatch[1]) {
        resolvedBudget = bMatch[1].trim();
      }
    }

    const now = new Date().toISOString();

    // DEDUPLICATION BY PHONE NUMBER:
    // Check if a lead with this 10-digit phone number already exists
    let existingLead: any = null;
    if (db.isPostgres()) {
      try {
        const pgCheck = await db.query(
          `SELECT * FROM leads WHERE RIGHT(REGEXP_REPLACE(phone, '\\D', '', 'g'), 10) = $1 ORDER BY created_at DESC LIMIT 1;`,
          [digitsOnly]
        );
        if (pgCheck.rows.length > 0) {
          existingLead = pgCheck.rows[0];
        }
      } catch (err: any) {
        console.error('Check existing lead error in PostgreSQL:', err.message);
      }
    }

    if (!existingLead && store.leads) {
      existingLead = store.leads.find((l: any) => {
        const pDigits = String(l.phone || '').replace(/\D/g, '').slice(-10);
        return pDigits === digitsOnly;
      });
    }

    let leadId = '';
    let finalLeadRecord: any = null;

    if (existingLead) {
      // 1. UPDATE EXISTING LEAD (No duplicate creation)
      leadId = existingLead.id;

      let existingNotes: any[] = [];
      if (Array.isArray(existingLead.notes)) {
        existingNotes = existingLead.notes;
      } else if (typeof existingLead.notes === 'string' && existingLead.notes.trim()) {
        try {
          const parsed = JSON.parse(existingLead.notes);
          if (Array.isArray(parsed)) existingNotes = parsed;
        } catch {}
      }

      const updateSummary = [
        source ? `Source: ${source}` : '',
        projSearch ? `Project: ${projSearch}` : '',
        resolvedBudget ? `Budget: ${resolvedBudget}` : '',
        visit_date ? `Visit: ${visit_date} (${visit_time || '10:00 AM'})` : '',
        message ? `Notes: ${message}` : ''
      ].filter(Boolean).join(' | ');

      existingNotes.unshift({
        id: uuidv4(),
        content: `Customer re-submitted inquiry. ${updateSummary}`,
        type: visit_date ? 'visit' : 'general',
        created_by: 'System',
        created_at: now
      });

      const updatedStage = visit_date ? 'Site Visit Scheduled' : (existingLead.stage || existingLead.status || 'New Lead');
      const updatedStatus = updatedStage;
      const updatedPriority = visit_date ? 'Hot' : (existingLead.priority || 'Warm');
      const finalProjectId = resolvedProjectId || existingLead.project_id;
      const finalBudget = resolvedBudget || existingLead.budget;
      const finalPlotSize = preferred_plot_size || existingLead.preferred_plot_size;
      const finalPlotId = plot_id || existingLead.plot_id || '';
      const finalPlotName = plot_name || existingLead.plot_name || '';

      finalLeadRecord = {
        ...existingLead,
        project_id: finalProjectId,
        plot_id: finalPlotId,
        plot_name: finalPlotName,
        preferred_plot_size: finalPlotSize,
        budget: finalBudget,
        stage: updatedStage,
        status: updatedStatus,
        priority: updatedPriority,
        site_visit_date: visit_date || existingLead.site_visit_date,
        site_visit_time: visit_time || existingLead.site_visit_time,
        notes: existingNotes,
        updated_at: now
      };

      if (db.isPostgres()) {
        try {
          await db.query(
            `UPDATE leads SET
              project_id = $1,
              plot_id = $2,
              plot_name = $3,
              preferred_plot_size = $4,
              budget = $5,
              stage = $6,
              status = $7,
              priority = $8,
              site_visit_date = COALESCE($9, site_visit_date),
              site_visit_time = COALESCE($10, site_visit_time),
              notes = $11,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $12;`,
            [
              finalProjectId,
              finalPlotId,
              finalPlotName,
              finalPlotSize,
              finalBudget,
              updatedStage,
              updatedStatus,
              updatedPriority,
              visit_date || null,
              visit_time || null,
              JSON.stringify(existingNotes),
              leadId
            ]
          );
        } catch (updateErr: any) {
          console.error('PostgreSQL lead UPDATE error:', updateErr.message);
        }
      }

      // Update in memory fallback
      if (store.leads) {
        const idx = store.leads.findIndex((l: any) => l.id === leadId);
        if (idx !== -1) {
          store.leads[idx] = { ...store.leads[idx], ...finalLeadRecord };
        }
      }
    } else {
      // 2. INSERT BRAND NEW LEAD
      leadId = uuidv4();
      finalLeadRecord = {
        id: leadId,
        project_id: resolvedProjectId,
        plot_id: plot_id || '',
        plot_name: plot_name || '',
        plot_description: plot_description || '',
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : '',
        preferred_plot_size: preferred_plot_size || '',
        budget: resolvedBudget,
        facing_preference: facing_preference || 'Any',
        message: message ? message.trim() : '',
        source: source || 'Website Form',
        status: visit_date ? 'Site Visit Scheduled' : 'New Lead',
        stage: visit_date ? 'Site Visit Scheduled' : 'New Lead',
        priority: visit_date ? 'Hot' : 'Warm',
        assigned_to: 'Sales Team',
        admin_notes: '',
        site_visit_date: visit_date || '',
        site_visit_time: visit_time || '',
        notes: [],
        created_at: now,
        updated_at: now
      };

      if (db.isPostgres()) {
        try {
          await db.query(
            `INSERT INTO leads (
              id, project_id, plot_id, plot_name, plot_description,
              name, phone, email, preferred_plot_size, budget,
              facing_preference, message, source, status, stage,
              priority, assigned_to, site_visit_date, notes, admin_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20);`,
            [
              finalLeadRecord.id,
              finalLeadRecord.project_id,
              finalLeadRecord.plot_id,
              finalLeadRecord.plot_name,
              finalLeadRecord.plot_description,
              finalLeadRecord.name,
              finalLeadRecord.phone,
              finalLeadRecord.email,
              finalLeadRecord.preferred_plot_size,
              finalLeadRecord.budget,
              finalLeadRecord.facing_preference,
              finalLeadRecord.message,
              finalLeadRecord.source,
              finalLeadRecord.status,
              finalLeadRecord.stage,
              finalLeadRecord.priority,
              finalLeadRecord.assigned_to,
              finalLeadRecord.site_visit_date,
              JSON.stringify(finalLeadRecord.notes),
              finalLeadRecord.admin_notes
            ]
          );
        } catch (pgErr: any) {
          console.error('Failed to insert lead into PostgreSQL, falling back to local store:', pgErr.message);
        }
      }

      if (!store.leads) store.leads = [];
      store.leads.unshift(finalLeadRecord);
    }

    // 3. If Visit Date is provided, register site visit in site_visits
    if (visit_date) {
      const proj = store.projects?.find((p: any) => p.id === resolvedProjectId);
      const visitProjName = proj ? proj.name : (project_interest || 'Park Avenue');

      if (db.isPostgres()) {
        try {
          // Check if an existing site visit booking exists for this lead on this date
          const existingVisitCheck = await db.query(
            'SELECT id FROM site_visits WHERE lead_id = $1 AND visit_date = $2 LIMIT 1;',
            [leadId, visit_date]
          );

          if (existingVisitCheck.rows.length === 0) {
            const visitId = uuidv4();
            await db.query(
              `INSERT INTO site_visits (
                id, lead_id, project_id, project_name, customer_name, customer_phone, customer_email, visit_date, visit_time, preferred_plot_size, pickup_needed, pickup_location, status, assigned_staff, notes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`,
              [
                visitId,
                leadId,
                resolvedProjectId,
                visitProjName,
                finalLeadRecord.name,
                finalLeadRecord.phone,
                finalLeadRecord.email,
                visit_date,
                visit_time || '10:00 AM',
                preferred_plot_size || resolvedBudget || '',
                false,
                '',
                'Requested',
                'Sales Team',
                message || ''
              ]
            );
          } else {
            // Update time & notes on existing visit
            await db.query(
              `UPDATE site_visits SET 
                visit_time = $1, 
                notes = COALESCE(notes, '') || ' | ' || $2,
                status = 'Requested'
              WHERE id = $3;`,
              [visit_time || '10:00 AM', message || 'Rescheduled/Reconfirmed', existingVisitCheck.rows[0].id]
            );
          }
        } catch (svErr: any) {
          console.error('Failed to register site_visit in PostgreSQL:', svErr.message);
        }
      }

      if (!store.site_visits) store.site_visits = [];
      const memVisit = store.site_visits.find((v: any) => v.lead_id === leadId && v.visit_date === visit_date);
      if (!memVisit) {
        store.site_visits.unshift({
          id: uuidv4(),
          lead_id: leadId,
          project_id: resolvedProjectId,
          project_name: visitProjName,
          customer_name: finalLeadRecord.name,
          customer_phone: finalLeadRecord.phone,
          customer_email: finalLeadRecord.email,
          visit_date,
          visit_time: visit_time || '10:00 AM',
          preferred_plot_size: preferred_plot_size || resolvedBudget || '',
          pickup_needed: false,
          pickup_location: '',
          status: 'Requested',
          assigned_staff: 'Sales Team',
          notes: message || '',
          created_at: now
        });
      }
    }

    // Save fallback data
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Thank you for your enquiry. Our team will connect with you shortly!',
      leadId: leadId
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit enquiry', error: err.message });
  }
}

export async function getAllLeadsAdmin(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let leads: any[] = [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query(`
          SELECT l.*, p.name as project_name 
          FROM leads l 
          LEFT JOIN projects p ON l.project_id = p.id 
          ORDER BY l.created_at DESC;
        `);
        leads = pgRes.rows;
      } catch {
        leads = [...store.leads];
      }
    } else {
      leads = [...store.leads];
    }

    const { status, projectId } = req.query;
    if (status && typeof status === 'string' && status !== 'All') {
      leads = leads.filter((l: any) => (l.status || l.stage || '').toLowerCase() === status.toLowerCase());
    }
    if (projectId && typeof projectId === 'string' && projectId !== 'All') {
      leads = leads.filter((l: any) => l.project_id === projectId);
    }

    // Enrich with fallback project name if not joined
    const enrichedLeads = leads.map((l: any) => {
      const proj = store.projects.find((p: any) => p.id === l.project_id);
      return {
        ...l,
        project_name: l.project_name || (proj ? proj.name : 'General Enquiry')
      };
    });

    res.json({
      success: true,
      count: enrichedLeads.length,
      data: enrichedLeads
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch leads', error: err.message });
  }
}

export async function updateLeadStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  try {
    const store = db.getFallbackData();
    const index = store.leads.findIndex((l: any) => l.id === id);

    if (db.isPostgres()) {
      try {
        await db.query(
          'UPDATE leads SET status = COALESCE($1, status), stage = COALESCE($1, stage), admin_notes = COALESCE($2, admin_notes), updated_at = CURRENT_TIMESTAMP WHERE id = $3;',
          [status || null, admin_notes !== undefined ? admin_notes : null, id]
        );
      } catch (err: any) {
        console.error('Failed to update lead in PostgreSQL:', err.message);
      }
    }

    if (index !== -1) {
      const current = store.leads[index];
      if (status) {
        current.status = status;
        current.stage = status;
      }
      if (admin_notes !== undefined) current.admin_notes = admin_notes;
      current.updated_at = new Date().toISOString();
      store.leads[index] = current;
      db.saveFallbackData(store);
    }

    res.json({
      success: true,
      message: 'Lead updated successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update lead', error: err.message });
  }
}

export async function deleteLead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    if (db.isPostgres()) {
      try {
        await db.query('DELETE FROM leads WHERE id = $1;', [id]);
      } catch (err: any) {
        console.error('Failed to delete lead from PostgreSQL:', err.message);
      }
    }

    const store = db.getFallbackData();
    store.leads = store.leads.filter((l: any) => l.id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete lead', error: err.message });
  }
}
