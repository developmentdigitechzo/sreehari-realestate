import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { getAllProjectsAdmin, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { getAllPlotsAdmin, createPlot, updatePlot, deletePlot } from '../controllers/plot.controller';
import { getAllLeadsAdmin, updateLeadStatus, deleteLead } from '../controllers/lead.controller';
import {
  getCrmLeads,
  getCrmLeadById,
  createCrmLead,
  updateCrmLead,
  deleteCrmLead,
  addCrmLeadNote,
  scheduleSiteVisit,
  getCrmStats
} from '../controllers/crm.controller';
import { addGalleryItem, deleteGalleryItem } from '../controllers/gallery.controller';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { getDashboardStats } from '../controllers/stats.controller';
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller';
import { uploadMedia } from '../controllers/upload.controller';
import {
  getAllSiteVisits,
  createSiteVisit,
  updateSiteVisit,
  deleteSiteVisit,
  getSiteVisitStats
} from '../controllers/siteVisit.controller';
import {
  getAllPopups,
  createPopup,
  updatePopup,
  deletePopup
} from '../controllers/popup.controller';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staff.controller';
import { authGuard } from '../middleware/auth';

const router = Router();

// Public auth login
router.post('/auth/login', login);

// Protected routes below
router.use(authGuard);

// Auth verification
router.get('/auth/me', getMe);

// Dashboard overview counters
router.get('/dashboard/stats', getDashboardStats);

// CRM & Leads Pipeline Management
router.get('/crm/stats', getCrmStats);
router.get('/crm/leads', getCrmLeads);
router.post('/crm/leads', createCrmLead);
router.get('/crm/leads/:id', getCrmLeadById);
router.put('/crm/leads/:id', updateCrmLead);
router.delete('/crm/leads/:id', deleteCrmLead);
router.post('/crm/leads/:id/notes', addCrmLeadNote);
router.post('/crm/leads/:id/schedule-visit', scheduleSiteVisit);

// Site Visit Requests Management
router.get('/site-visits/stats', getSiteVisitStats);
router.get('/site-visits', getAllSiteVisits);
router.post('/site-visits', createSiteVisit);
router.put('/site-visits/:id', updateSiteVisit);
router.delete('/site-visits/:id', deleteSiteVisit);

// Standard Leads & Enquiry Management (Backward compatibility)
router.get('/leads', getAllLeadsAdmin);
router.put('/leads/:id/status', updateLeadStatus);
router.delete('/leads/:id', deleteLead);

// Projects Management
router.get('/projects', getAllProjectsAdmin);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Plots Inventory Management
router.get('/plots', getAllPlotsAdmin);
router.post('/plots', createPlot);
router.put('/plots/:id', updatePlot);
router.delete('/plots/:id', deletePlot);

// Blog Articles Management
router.get('/blogs', getAllBlogs);
router.get('/blogs/:id', getBlogById);
router.post('/blogs', createBlog);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Ad & Seasonal Popups Management
router.get('/popups', getAllPopups);
router.post('/popups', createPopup);
router.put('/popups/:id', updatePopup);
router.delete('/popups/:id', deletePopup);

// Gallery & Media
router.post('/gallery', addGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);
router.post('/upload', uploadMedia);

// Settings & SEO
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Staff & Access Control Management
router.get('/staff', getAllStaff);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

export default router;
