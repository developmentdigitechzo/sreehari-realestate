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
    const digitsOnly = String(phone).replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
      return;
    }

    const store = db.getFallbackData();
    let resolvedProjectId = project_id || null;

    // Resolve project_id by project_interest if provided
    if (!resolvedProjectId && project_interest) {
      const match = store.projects.find((p: any) =>
        p.name.toLowerCase() === project_interest.toLowerCase() ||
        p.slug.toLowerCase() === project_interest.toLowerCase()
      );
      if (match) {
        resolvedProjectId = match.id;
      }
    }

    const resolvedBudget = budget || preferred_budget || '';
    const leadId = uuidv4();
    const now = new Date().toISOString();

    const newLead = {
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
      status: 'New Lead',
      stage: 'New Lead',
      priority: 'Warm',
      assigned_to: 'Sales Team',
      admin_notes: '',
      site_visit_date: visit_date || '',
      notes: [],
      created_at: now,
      updated_at: now
    };

    // 1. Direct PostgreSQL Insert
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
            newLead.id,
            newLead.project_id,
            newLead.plot_id,
            newLead.plot_name,
            newLead.plot_description,
            newLead.name,
            newLead.phone,
            newLead.email,
            newLead.preferred_plot_size,
            newLead.budget,
            newLead.facing_preference,
            newLead.message,
            newLead.source,
            newLead.status,
            newLead.stage,
            newLead.priority,
            newLead.assigned_to,
            newLead.site_visit_date,
            JSON.stringify(newLead.notes),
            newLead.admin_notes
          ]
        );
      } catch (pgErr: any) {
        console.error('Failed to insert lead into PostgreSQL, falling back to local store:', pgErr.message);
      }
    }

    // 2. Local fallback sync
    store.leads.unshift(newLead);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'Thank you for your enquiry. Our team will connect with you shortly!',
      leadId: newLead.id
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
