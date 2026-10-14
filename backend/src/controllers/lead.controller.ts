import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';

export async function submitPublicLead(req: Request, res: Response): Promise<void> {
  try {
    const { name, phone, email, project_id, preferred_plot_size, message, source, visit_date, visit_time } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Name and Phone number are required' });
      return;
    }

    // Phone sanity check (min 10 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
      return;
    }

    const store = db.getFallbackData();
    const newLead = {
      id: uuidv4(),
      project_id: project_id || null,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      preferred_plot_size: preferred_plot_size || '',
      message: message ? message.trim() : '',
      source: source || 'Website Form',
      status: 'New', // New, Contacted, Follow-up, Converted, Closed
      admin_notes: '',
      site_visit_date: visit_date || '',
      site_visit_time: visit_time || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

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
    let leads = [...store.leads];

    const { status, projectId } = req.query;
    if (status && typeof status === 'string') {
      leads = leads.filter((l: any) => l.status.toLowerCase() === status.toLowerCase());
    }
    if (projectId && typeof projectId === 'string') {
      leads = leads.filter((l: any) => l.project_id === projectId);
    }

    // Enrich with project name
    const enrichedLeads = leads.map((l: any) => {
      const proj = store.projects.find((p: any) => p.id === l.project_id);
      return {
        ...l,
        project_name: proj ? proj.name : 'General Enquiry'
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

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const current = store.leads[index];
    if (status) current.status = status;
    if (admin_notes !== undefined) current.admin_notes = admin_notes;
    current.updated_at = new Date().toISOString();

    store.leads[index] = current;
    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: current
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update lead', error: err.message });
  }
}

export async function deleteLead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const store = db.getFallbackData();
    const initialLen = store.leads.length;
    store.leads = store.leads.filter((l: any) => l.id !== id);

    if (store.leads.length === initialLen) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    db.saveFallbackData(store);

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete lead', error: err.message });
  }
}
