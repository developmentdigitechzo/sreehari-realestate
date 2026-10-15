import { Router } from 'express';
import { getPublicProjects, getPublicProjectBySlug } from '../controllers/project.controller';
import { getPublicPlotsByProjectSlug, getPublicPlotsByProjectId } from '../controllers/plot.controller';
import { submitPublicLead } from '../controllers/lead.controller';
import { getPublicGallery } from '../controllers/gallery.controller';
import { getSettings } from '../controllers/settings.controller';
import { getAllBlogs, getBlogById } from '../controllers/blog.controller';
import { createSiteVisit } from '../controllers/siteVisit.controller';
import { getActivePopups } from '../controllers/popup.controller';
import { db } from '../config/db';

const router = Router();

// Projects & Plots
router.get('/projects', getPublicProjects);
router.get('/projects/:slug', getPublicProjectBySlug);
router.get('/projects/:slug/plots', getPublicPlotsByProjectSlug);
router.get('/plots/by-project/:projectId', getPublicPlotsByProjectId);

// Blogs
router.get('/blogs', getAllBlogs);
router.get('/blogs/:slug', getBlogById);

// Public Active Popups
router.get('/popups', getActivePopups);

// Leads & Enquiries
router.post('/leads', submitPublicLead);

// Public Free Site Visit Booking
router.post('/site-visits', createSiteVisit);

// Gallery
router.get('/gallery', getPublicGallery);

// Settings (Public Contact Info)
router.get('/settings', getSettings);

// Amenities List
router.get('/amenities', (req, res) => {
  const store = db.getFallbackData();
  res.json({ success: true, data: store.amenities });
});

export default router;
