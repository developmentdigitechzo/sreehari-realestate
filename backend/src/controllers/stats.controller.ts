import { Request, Response } from 'express';
import { db } from '../config/db';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const store = db.getFallbackData();
    let projects: any[] = store.projects || [];
    let plots: any[] = store.plots || [];
    let leads: any[] = store.leads || [];
    let siteVisits: any[] = store.site_visits || [];

    if (db.isPostgres()) {
      try {
        const projRes = await db.query('SELECT * FROM projects;');
        projects = projRes.rows;
      } catch {}

      try {
        const plotRes = await db.query('SELECT * FROM plots;');
        plots = plotRes.rows;
      } catch {}

      try {
        const leadRes = await db.query('SELECT * FROM leads;');
        leads = leadRes.rows;
      } catch {}

      try {
        const visitRes = await db.query('SELECT * FROM site_visits;');
        siteVisits = visitRes.rows;
      } catch {}
    }

    const totalProjects = projects.length;
    const ongoingProjects = projects.filter((p: any) => (p.status || '').toLowerCase() === 'ongoing').length;
    const upcomingProjects = projects.filter((p: any) => (p.status || '').toLowerCase() === 'upcoming').length;
    const completedProjects = projects.filter((p: any) =>
      (p.status || '').toLowerCase() === 'completed' || (p.status || '').toLowerCase() === 'sold out'
    ).length;

    const totalPlots = plots.length;
    const availablePlots = plots.filter((p: any) => (p.status || '').toLowerCase() === 'available').length;
    const bookedPlots = plots.filter((p: any) => (p.status || '').toLowerCase() === 'booked').length;
    const soldPlots = plots.filter((p: any) => (p.status || '').toLowerCase() === 'sold').length;

    const totalLeads = leads.length;
    const newLeads = leads.filter((l: any) => (l.status || l.stage || '').toLowerCase() === 'new').length;
    const contactedLeads = leads.filter((l: any) => (l.status || l.stage || '').toLowerCase() === 'contacted').length;
    const followupLeads = leads.filter((l: any) => (l.status || l.stage || '').toLowerCase() === 'follow-up').length;
    const convertedLeads = leads.filter((l: any) => (l.status || l.stage || '').toLowerCase() === 'converted' || (l.status || l.stage || '').toLowerCase().includes('registered')).length;
    const hotLeads = leads.filter((l: any) => (l.priority || '').toLowerCase() === 'hot').length;

    const siteVisitsScheduled = Math.max(
      siteVisits.filter((v: any) => (v.status || '').toLowerCase() !== 'cancelled').length,
      leads.filter((l: any) => (l.stage || l.status || '').toLowerCase().includes('site visit')).length
    );

    const recentLeads = leads.slice(0, 5).map((l: any) => {
      const proj = projects.find((p: any) => p.id === l.project_id);
      return {
        ...l,
        project_name: proj ? proj.name : 'General Enquiry'
      };
    });

    const recentProjects = projects.slice(0, 4);

    res.json({
      success: true,
      data: {
        total_projects: totalProjects,
        ongoing_projects: ongoingProjects,
        upcoming_projects: upcomingProjects,
        completed_projects: completedProjects,

        total_plots: totalPlots,
        available_plots: availablePlots,
        booked_plots: bookedPlots,
        sold_plots: soldPlots,

        total_leads: totalLeads,
        hot_leads: hotLeads,
        site_visits_scheduled: siteVisitsScheduled,

        projects: {
          total: totalProjects,
          ongoing: ongoingProjects,
          upcoming: upcomingProjects,
          completed: completedProjects
        },
        plots: {
          total: totalPlots,
          available: availablePlots,
          booked: bookedPlots,
          sold: soldPlots
        },
        leads: {
          total: totalLeads,
          new: newLeads,
          contacted: contactedLeads,
          followup: followupLeads,
          converted: convertedLeads,
          hot: hotLeads
        },
        recentLeads,
        recentProjects
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: err.message });
  }
}
