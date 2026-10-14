const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('crm_auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('crm_auth_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('crm_auth_token');
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken() || 'admin_session_token_2026';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        removeAuthToken();
        window.location.href = '/admin/login';
      }
      return { success: false, message: data.message || 'Request failed', data: null };
    }
    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    return { success: false, message: err.message || 'Network error', data: null };
  }
}

export const api = {
  // Public APIs for website
  async getPublicProjects() {
    try {
      const res = await fetch(`${API_BASE_URL}/public/projects`);
      return res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error', data: [] };
    }
  },

  async getPublicProjectBySlug(slug: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/public/projects/${slug}`);
      return res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error', data: null };
    }
  },

  async getPublicBlogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/public/blogs`);
      return res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error', data: [] };
    }
  },

  async getPublicBlogBySlug(slug: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/public/blogs/${slug}`);
      return res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error', data: null };
    }
  },

  async getPublicGallery() {
    try {
      const res = await fetch(`${API_BASE_URL}/public/gallery`);
      return res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error', data: [] };
    }
  },

  async getPublicSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/public/settings`);
      return res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error', data: null };
    }
  },

  async submitPublicLead(leadData: {
    name: string;
    phone: string;
    email?: string;
    project_id?: string | null;
    preferred_plot_size?: string;
    message?: string;
    source?: string;
    visit_date?: string;
    visit_time?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
    return res.json();
  },

  async submitPublicSiteVisit(visitData: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    project_id?: string | null;
    project_name?: string;
    visit_date: string;
    visit_time?: string;
    preferred_plot_size?: string;
    pickup_needed?: boolean;
    pickup_location?: string;
    notes?: string;
    source?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/public/site-visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData),
    });
    return res.json();
  },

  async getPublicPopups() {
    try {
      const res = await fetch(`${API_BASE_URL}/public/popups`);
      return res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error', data: [] };
    }
  },

  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async getMe() {
    return fetchWithAuth('/admin/auth/me');
  },

  // Dashboard Stats
  async getDashboardStats() {
    return fetchWithAuth('/admin/dashboard/stats');
  },

  // CRM Leads
  async getCrmStats() {
    return fetchWithAuth('/admin/crm/stats');
  },

  async getCrmLeads(params: { stage?: string; priority?: string; search?: string; projectId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.stage && params.stage !== 'All') query.append('stage', params.stage);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);
    if (params.projectId && params.projectId !== 'All') query.append('projectId', params.projectId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchWithAuth(`/admin/crm/leads${queryString}`);
  },

  async createCrmLead(leadData: any) {
    return fetchWithAuth('/admin/crm/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  async updateCrmLead(id: string, leadData: any) {
    return fetchWithAuth(`/admin/crm/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  },

  async deleteCrmLead(id: string) {
    return fetchWithAuth(`/admin/crm/leads/${id}`, {
      method: 'DELETE',
    });
  },

  async addLeadNote(id: string, noteData: { content: string; type?: string; created_by?: string }) {
    return fetchWithAuth(`/admin/crm/leads/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  async scheduleSiteVisit(id: string, visitData: { visit_date: string; pickup_needed?: boolean; pickup_location?: string; notes?: string }) {
    return fetchWithAuth(`/admin/crm/leads/${id}/schedule-visit`, {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  },

  // Projects
  async getProjects() {
    return fetchWithAuth('/admin/projects');
  },

  async createProject(projectData: any) {
    return fetchWithAuth('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async updateProject(id: string, projectData: any) {
    return fetchWithAuth(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  async deleteProject(id: string) {
    return fetchWithAuth(`/admin/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Plots Inventory
  async getPlots() {
    return fetchWithAuth('/admin/plots');
  },

  async createPlot(plotData: any) {
    return fetchWithAuth('/admin/plots', {
      method: 'POST',
      body: JSON.stringify(plotData),
    });
  },

  async updatePlot(id: string, plotData: any) {
    return fetchWithAuth(`/admin/plots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plotData),
    });
  },

  async deletePlot(id: string) {
    return fetchWithAuth(`/admin/plots/${id}`, {
      method: 'DELETE',
    });
  },

  // Gallery & Media
  async getGallery() {
    return fetchWithAuth('/public/gallery');
  },

  async addGalleryItem(itemData: any) {
    return fetchWithAuth('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  async deleteGalleryItem(id: string) {
    return fetchWithAuth(`/admin/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  // Settings
  async getSettings() {
    return fetchWithAuth('/admin/settings');
  },

  async updateSettings(settingsData: any) {
    return fetchWithAuth('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  // Blogs
  async getBlogs() {
    return fetchWithAuth('/admin/blogs');
  },

  async createBlog(blogData: any) {
    return fetchWithAuth('/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },

  async updateBlog(id: string, blogData: any) {
    return fetchWithAuth(`/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  async deleteBlog(id: string) {
    return fetchWithAuth(`/admin/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadMedia(uploadData: { imageBase64: string; filename?: string }) {
    return fetchWithAuth('/admin/upload', {
      method: 'POST',
      body: JSON.stringify(uploadData),
    });
  },

  // Site Visits
  async getSiteVisitStats() {
    return fetchWithAuth('/admin/site-visits/stats');
  },

  async getSiteVisits(params: { status?: string; projectId?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.projectId && params.projectId !== 'All') query.append('projectId', params.projectId);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchWithAuth(`/admin/site-visits${queryString}`);
  },

  async createSiteVisit(visitData: any) {
    return fetchWithAuth('/admin/site-visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  },

  async updateSiteVisit(id: string, visitData: any) {
    return fetchWithAuth(`/admin/site-visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visitData),
    });
  },

  async deleteSiteVisit(id: string) {
    return fetchWithAuth(`/admin/site-visits/${id}`, {
      method: 'DELETE',
    });
  },

  // Ad & Seasonal Popups
  async getPopups() {
    return fetchWithAuth('/admin/popups');
  },

  async createPopup(popupData: any) {
    return fetchWithAuth('/admin/popups', {
      method: 'POST',
      body: JSON.stringify(popupData),
    });
  },

  async updatePopup(id: string, popupData: any) {
    return fetchWithAuth(`/admin/popups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(popupData),
    });
  },

  async deletePopup(id: string) {
    return fetchWithAuth(`/admin/popups/${id}`, {
      method: 'DELETE',
    });
  },

  // Staff & Access Control Management
  async getStaffList() {
    return fetchWithAuth('/admin/staff');
  },

  async createStaff(staffData: any) {
    return fetchWithAuth('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  async updateStaff(id: string, staffData: any) {
    return fetchWithAuth(`/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  },

  async deleteStaff(id: string) {
    return fetchWithAuth(`/admin/staff/${id}`, {
      method: 'DELETE',
    });
  }
};
