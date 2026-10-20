import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export interface CrmNote {
  id: string;
  content: string;
  type: 'call' | 'visit' | 'whatsapp' | 'general';
  created_by: string;
  created_at: string;
}

export interface CrmLead {
  id: string;
  project_id: string | null;
  plot_id?: string;
  plot_name?: string;
  plot_description?: string;
  name: string;
  phone: string;
  email: string;
  preferred_plot_size?: string;
  budget?: string;
  facing_preference?: string;
  message?: string;
  source: string;
  stage: string;
  status: string;
  priority: string;
  assigned_to?: string;
  site_visit_date?: string | null;
  site_visit_pickup_needed?: boolean;
  next_follow_up_date?: string | null;
  notes: CrmNote[];
  created_at: string;
  updated_at: string;
}

export function normalizeLeadStage(stg?: string): string {
  if (!stg) return 'New Lead';
  const s = stg.trim();
  if (s === 'New' || s === 'New Lead') return 'New Lead';
  if (s === 'Contacted' || s === 'Initial Contact') return 'Initial Contact';
  if (s === 'Follow-up' || s === 'Follow Up Pending') return 'Follow Up Pending';
  if (s === 'Converted' || s === 'Booking') return 'Booking';
  if (s === 'Closed' || s === 'Lost Closed') return 'Lost Closed';
  return s;
}

// 1. Get All CRM Leads with Advanced Filtering
export async function getCrmLeads(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let leads: any[] = [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM leads ORDER BY created_at DESC;');
        leads = pgRes.rows;
      } catch {
        leads = [...(store.leads || [])];
      }
    } else {
      leads = [...(store.leads || [])];
    }

    const { stage, status, priority, projectId, search } = req.query;

    if (stage && typeof stage === 'string' && stage !== 'All') {
      const targetStage = normalizeLeadStage(stage).toLowerCase();
      leads = leads.filter(l => normalizeLeadStage(l.stage || l.status).toLowerCase() === targetStage);
    } else if (status && typeof status === 'string' && status !== 'All') {
      const targetStatus = normalizeLeadStage(status).toLowerCase();
      leads = leads.filter(l => normalizeLeadStage(l.status || l.stage).toLowerCase() === targetStatus);
    }

    if (priority && typeof priority === 'string' && priority !== 'All') {
      leads = leads.filter(l => (l.priority || 'Warm').toLowerCase() === priority.toLowerCase());
    }

    if (projectId && typeof projectId === 'string' && projectId !== 'All') {
      leads = leads.filter(l => l.project_id === projectId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      leads = leads.filter(l =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.plot_id && l.plot_id.toLowerCase().includes(q)) ||
        (l.plot_name && l.plot_name.toLowerCase().includes(q))
      );
    }

    leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const enrichedLeads = leads.map(l => {
      const proj = store.projects.find((p: any) => p.id === l.project_id);
      const normalizedStage = normalizeLeadStage(l.stage || l.status);

      let leadNotes: any[] = [];
      if (Array.isArray(l.notes) && l.notes.length > 0) {
        leadNotes = l.notes;
      } else if (typeof l.notes === 'string' && l.notes.trim()) {
        try {
          const parsed = JSON.parse(l.notes);
          if (Array.isArray(parsed) && parsed.length > 0) leadNotes = parsed;
        } catch {}
      }
      if (leadNotes.length === 0 && l.admin_notes && l.admin_notes.trim()) {
        leadNotes = [{
          id: uuidv4(),
          content: l.admin_notes.trim(),
          type: 'general',
          created_by: l.assigned_to || 'Admin',
          created_at: l.updated_at || l.created_at
        }];
      }

      return {
        ...l,
        plot_id: l.plot_id || '',
        plot_name: l.plot_name || '',
        plot_description: l.plot_description || '',
        stage: normalizedStage,
        status: normalizedStage,
        priority: l.priority || 'Warm',
        assigned_to: l.assigned_to || 'Sales Team',
        budget: l.budget || '',
        facing_preference: l.facing_preference || 'Any',
        site_visit_date: l.site_visit_date || null,
        site_visit_time: l.site_visit_time || null,
        next_follow_up_date: l.next_follow_up_date || null,
        next_follow_up_time: l.next_follow_up_time || null,
        notes: leadNotes,
        project_name: proj ? proj.name : 'General Plot Enquiry',
        project_location: proj ? `${proj.location_area}, ${proj.location_city}` : ''
      };
    });

    res.json({
      success: true,
      count: enrichedLeads.length,
      data: enrichedLeads
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch CRM leads', error: err.message });
  }
}

// 2. Get Single CRM Lead
export async function getCrmLeadById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    let lead = store.leads.find((l: any) => l.id === id);

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM leads WHERE id = $1;', [id]);
        if (pgRes.rows.length > 0) lead = pgRes.rows[0];
      } catch {}
    }

    if (!lead) {
      res.status(404).json({ success: false, message: 'CRM Lead not found' });
      return;
    }

    const proj = store.projects.find((p: any) => p.id === lead.project_id);

    let leadNotes: any[] = [];
    if (Array.isArray(lead.notes) && lead.notes.length > 0) {
      leadNotes = lead.notes;
    } else if (typeof lead.notes === 'string' && lead.notes.trim()) {
      try {
        const parsed = JSON.parse(lead.notes);
        if (Array.isArray(parsed) && parsed.length > 0) leadNotes = parsed;
      } catch {}
    }
    if (leadNotes.length === 0 && lead.admin_notes && lead.admin_notes.trim()) {
      leadNotes = [{
        id: uuidv4(),
        content: lead.admin_notes.trim(),
        type: 'general',
        created_by: lead.assigned_to || 'Sales Team',
        created_at: lead.updated_at || lead.created_at
      }];
    }

    const enriched = {
      ...lead,
      plot_id: lead.plot_id || '',
      plot_name: lead.plot_name || '',
      plot_description: lead.plot_description || '',
      stage: lead.stage || lead.status || 'New',
      priority: lead.priority || 'Warm',
      assigned_to: lead.assigned_to || 'Sales Team',
      notes: leadNotes,
      project_name: proj ? proj.name : 'General Enquiry',
      project_location: proj ? `${proj.location_area}, ${proj.location_city}` : ''
    };

    res.json({
      success: true,
      data: enriched
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch CRM lead details', error: err.message });
  }
}

// 3. Create Manual CRM Lead with Direct PostgreSQL Insert
export async function createCrmLead(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      phone,
      email,
      project_id,
      plot_id,
      plot_name,
      plot_description,
      preferred_plot_size,
      budget,
      facing_preference,
      message,
      source,
      stage,
      priority,
      assigned_to,
      site_visit_date,
      site_visit_time,
      next_follow_up_date,
      next_follow_up_time,
      initial_note
    } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Customer Name and Phone number are required' });
      return;
    }

    const store = db.getFallbackData();

    const initialNotes: CrmNote[] = [];
    if (initial_note && initial_note.trim()) {
      initialNotes.push({
        id: uuidv4(),
        content: initial_note.trim(),
        type: 'general',
        created_by: assigned_to || 'Admin',
        created_at: new Date().toISOString()
      });
    }

    const finalStage = normalizeLeadStage(stage || status);

    const newLead: any = {
      id: uuidv4(),
      project_id: project_id || null,
      plot_id: plot_id ? plot_id.trim() : '',
      plot_name: plot_name ? plot_name.trim() : '',
      plot_description: plot_description ? plot_description.trim() : '',
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      preferred_plot_size: preferred_plot_size || '',
      budget: budget || '',
      facing_preference: facing_preference || 'Any',
      message: message ? message.trim() : '',
      source: source || 'Walk-in Office',
      stage: finalStage,
      status: finalStage,
      priority: priority || 'Warm',
      assigned_to: assigned_to || 'Sales Team',
      site_visit_date: site_visit_date || null,
      site_visit_time: site_visit_time || null,
      next_follow_up_date: next_follow_up_date || null,
      next_follow_up_time: next_follow_up_time || null,
      notes: initialNotes,
      admin_notes: initial_note || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Direct PostgreSQL Insert
    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO leads (id, project_id, name, phone, email, preferred_plot_size, message, source, status, stage, priority, admin_notes, notes, plot_id, plot_name, plot_description, budget, facing_preference, assigned_to, site_visit_date, site_visit_time, next_follow_up_date, next_follow_up_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23);`,
          [
            newLead.id,
            newLead.project_id || null,
            newLead.name,
            newLead.phone,
            newLead.email,
            newLead.preferred_plot_size,
            newLead.message,
            newLead.source,
            newLead.status,
            newLead.stage,
            newLead.priority,
            newLead.admin_notes,
            JSON.stringify(initialNotes),
            newLead.plot_id,
            newLead.plot_name,
            newLead.plot_description,
            newLead.budget,
            newLead.facing_preference,
            newLead.assigned_to,
            newLead.site_visit_date || null,
            newLead.site_visit_time || null,
            newLead.next_follow_up_date || null,
            newLead.next_follow_up_time || null
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL INSERT error:', pgErr.message);
      }
    }

    // 2. Also save to fallback memory store
    store.leads.unshift(newLead);
    db.saveFallbackData(store);

    res.status(201).json({
      success: true,
      message: 'New CRM lead created successfully',
      data: newLead
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create CRM lead', error: err.message });
  }
}

// 4. Update CRM Lead
export async function updateCrmLead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    const index = store.leads.findIndex((l: any) => l.id === id);

    const {
      name,
      phone,
      email,
      source,
      project_id,
      plot_id,
      plot_name,
      plot_description,
      preferred_plot_size,
      budget,
      facing_preference,
      stage,
      status,
      priority,
      assigned_to,
      site_visit_date,
      site_visit_time,
      next_follow_up_date,
      next_follow_up_time,
      message,
      admin_notes
    } = req.body;

    const current = index !== -1 ? store.leads[index] : {};
    const finalStage = normalizeLeadStage(stage || status || current.stage || current.status || 'New Lead');

    const updated = {
      ...current,
      id,
      name: name !== undefined ? name.trim() : current.name || '',
      phone: phone !== undefined ? phone.trim() : current.phone || '',
      email: email !== undefined ? email.trim() : current.email || '',
      source: source !== undefined ? source.trim() : current.source || 'Manual',
      project_id: project_id !== undefined ? project_id : current.project_id,
      plot_id: plot_id !== undefined ? plot_id.trim() : current.plot_id || '',
      plot_name: plot_name !== undefined ? plot_name.trim() : current.plot_name || '',
      plot_description: plot_description !== undefined ? plot_description.trim() : current.plot_description || '',
      preferred_plot_size: preferred_plot_size !== undefined ? preferred_plot_size : current.preferred_plot_size,
      budget: budget !== undefined ? budget : current.budget,
      facing_preference: facing_preference !== undefined ? facing_preference : current.facing_preference,
      stage: finalStage,
      status: finalStage,
      priority: priority !== undefined ? priority : current.priority || 'Warm',
      assigned_to: assigned_to !== undefined ? assigned_to : current.assigned_to || 'Sales Team',
      site_visit_date: site_visit_date !== undefined ? site_visit_date : current.site_visit_date,
      site_visit_time: site_visit_time !== undefined ? site_visit_time : current.site_visit_time,
      next_follow_up_date: next_follow_up_date !== undefined ? next_follow_up_date : current.next_follow_up_date,
      next_follow_up_time: next_follow_up_time !== undefined ? next_follow_up_time : current.next_follow_up_time,
      message: message !== undefined ? message : current.message,
      admin_notes: admin_notes !== undefined ? admin_notes : current.admin_notes,
      updated_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `UPDATE leads SET 
            name=$1, phone=$2, email=$3, source=$4, status=$5, stage=$6, priority=$7, 
            plot_id=$8, plot_name=$9, plot_description=$10, budget=$11, facing_preference=$12, 
            assigned_to=$13, project_id=$14, site_visit_date=$15, site_visit_time=$16, 
            next_follow_up_date=$17, next_follow_up_time=$18, message=$19, preferred_plot_size=$20, 
            updated_at=CURRENT_TIMESTAMP 
          WHERE id=$21;`,
          [
            updated.name,
            updated.phone,
            updated.email,
            updated.source,
            updated.status,
            updated.stage,
            updated.priority,
            updated.plot_id,
            updated.plot_name,
            updated.plot_description,
            updated.budget,
            updated.facing_preference,
            updated.assigned_to,
            updated.project_id || null,
            updated.site_visit_date || null,
            updated.site_visit_time || null,
            updated.next_follow_up_date || null,
            updated.next_follow_up_time || null,
            updated.message || '',
            updated.preferred_plot_size || '',
            id
          ]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL UPDATE error:', pgErr.message);
      }
    }

    if (index !== -1) {
      store.leads[index] = updated;
    } else {
      store.leads.unshift(updated);
    }
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'CRM lead updated successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update CRM lead', error: err.message });
  }
}

// 5. Add Activity Log Note
export async function addCrmLeadNote(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { content, type, created_by } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ success: false, message: 'Note content is required' });
    return;
  }

  try {
    const store = db.getFallbackData();
    const index = store.leads.findIndex((l: any) => l.id === id);

    const newNote: CrmNote = {
      id: uuidv4(),
      content: content.trim(),
      type: type || 'general',
      created_by: created_by || 'Sales Executive',
      created_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        const leadRes = await db.query('SELECT notes, admin_notes FROM leads WHERE id = $1;', [id]);
        let existingNotes: any[] = [];
        if (leadRes.rows.length > 0) {
          const rawNotes = leadRes.rows[0].notes;
          if (Array.isArray(rawNotes)) {
            existingNotes = rawNotes;
          } else if (typeof rawNotes === 'string' && rawNotes.trim()) {
            try {
              const p = JSON.parse(rawNotes);
              if (Array.isArray(p)) existingNotes = p;
            } catch {}
          }
          if (existingNotes.length === 0 && leadRes.rows[0].admin_notes && leadRes.rows[0].admin_notes.trim()) {
            existingNotes.push({
              id: uuidv4(),
              content: leadRes.rows[0].admin_notes.trim(),
              type: 'general',
              created_by: 'Sales Team',
              created_at: new Date().toISOString()
            });
          }
        }
        existingNotes.unshift(newNote);
        await db.query(
          `UPDATE leads SET notes = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3;`,
          [JSON.stringify(existingNotes), newNote.content, id]
        );
      } catch (pgErr: any) {
        console.error('PostgreSQL add note error:', pgErr.message);
      }
    }

    if (index !== -1) {
      const lead = store.leads[index];
      if (!Array.isArray(lead.notes)) lead.notes = [];
      lead.notes.unshift(newNote);
      lead.admin_notes = newNote.content;
      lead.updated_at = new Date().toISOString();
      store.leads[index] = lead;
      db.saveFallbackData(store);
    }

    res.status(201).json({
      success: true,
      message: 'Note added to lead timeline',
      data: newNote
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add note', error: err.message });
  }
}

// 6. Schedule Site Visit
export async function scheduleSiteVisit(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { visit_date, pickup_needed, pickup_location, notes } = req.body;

  if (!visit_date) {
    res.status(400).json({ success: false, message: 'Site visit date and time are required' });
    return;
  }

  try {
    const store = db.getFallbackData();
    const index = store.leads.findIndex((l: any) => l.id === id);

    const visitNoteText = `Site visit scheduled for ${new Date(visit_date).toLocaleString('en-IN')}.${
      pickup_needed ? ` Car pickup requested from: ${pickup_location || 'Customer location'}.` : ''
    }${notes ? ` Notes: ${notes}` : ''}`;

    if (db.isPostgres()) {
      try {
        await db.query(`UPDATE leads SET status = 'Site Visit Scheduled', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`, [visitNoteText, id]);
      } catch {}
    }

    if (index !== -1) {
      const lead = store.leads[index];
      lead.stage = 'Site Visit Scheduled';
      lead.status = 'Site Visit Scheduled';
      lead.site_visit_date = visit_date;
      lead.site_visit_pickup_needed = Boolean(pickup_needed);
      if (!Array.isArray(lead.notes)) lead.notes = [];
      lead.notes.unshift({
        id: uuidv4(),
        content: visitNoteText,
        type: 'visit',
        created_by: 'Site Visit Coordinator',
        created_at: new Date().toISOString()
      });
      lead.updated_at = new Date().toISOString();
      store.leads[index] = lead;
      db.saveFallbackData(store);
    }

    res.json({
      success: true,
      message: 'Site visit scheduled successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to schedule site visit', error: err.message });
  }
}

// 7. Get High-Level CRM Pipeline Analytics
export async function getCrmStats(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let leads: any[] = store.leads || [];
    let siteVisits: any[] = store.site_visits || [];

    if (db.isPostgres()) {
      try {
        const pgRes = await db.query('SELECT * FROM leads;');
        leads = pgRes.rows;
      } catch {}
      try {
        const svRes = await db.query('SELECT * FROM site_visits;');
        if (svRes.rows.length > 0) siteVisits = svRes.rows;
      } catch {}
    }

    const totalLeads = leads.length;
    const hotLeads = leads.filter((l: any) => (l.priority || '').toLowerCase() === 'hot').length;
    const siteVisitsScheduled = Math.max(
      siteVisits.filter((v: any) => (v.status || '').toLowerCase() !== 'cancelled').length,
      leads.filter((l: any) => (l.stage || l.status || '').toLowerCase().includes('site visit')).length
    );
    const tokenPaid = leads.filter((l: any) =>
      (l.stage || l.status || '').toLowerCase().includes('token')
    ).length;
    const registered = leads.filter((l: any) =>
      (l.stage || l.status || '').toLowerCase().includes('registered') ||
      (l.stage || l.status || '').toLowerCase().includes('converted')
    ).length;

    const conversionRate = totalLeads > 0
      ? Math.round(((registered + tokenPaid) / totalLeads) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        total_leads: totalLeads,
        hot_leads: hotLeads,
        site_visits_scheduled: siteVisitsScheduled,
        token_paid: tokenPaid,
        registered_deals: registered,
        conversion_rate_percent: conversionRate,
        pipeline_stages: {
          new: leads.filter((l: any) => (l.stage || l.status || '').toLowerCase() === 'new').length,
          contacted: leads.filter((l: any) => (l.stage || l.status || '').toLowerCase() === 'contacted').length,
          site_visit: siteVisitsScheduled,
          negotiation: leads.filter((l: any) => (l.stage || l.status || '').toLowerCase() === 'negotiation').length,
          token: tokenPaid,
          registered: registered
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch CRM stats', error: err.message });
  }
}

// 8. Delete CRM Lead with Direct PostgreSQL Delete
export async function deleteCrmLead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();

    if (db.isPostgres()) {
      try {
        await db.query('DELETE FROM leads WHERE id = $1;', [id]);
      } catch (pgErr: any) {
        console.error('PostgreSQL DELETE error:', pgErr.message);
      }
    }

    store.leads = store.leads.filter((l: any) => l.id !== id);
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'CRM lead deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete lead', error: err.message });
  }
}
