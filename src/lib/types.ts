export interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
  permissions?: string[];
  status?: string;
}

export interface StaffUser {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  status: 'Active' | 'Disabled' | string;
  password_plain?: string;
  created_at?: string;
}

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
  project_name?: string;
  project_location?: string;
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

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Sold Out' | 'Draft';
  location_city: string;
  location_area: string;
  total_acres: number;
  total_plots: number;
  available_plots: number;
  price_starting_lakhs: number;
  hero_image: string;
  created_at: string;
}

export interface Plot {
  id: string;
  project_id: string;
  project_name?: string;
  title?: string;
  slug?: string;
  type?: string;
  category?: 'Sale' | 'Rent' | 'Lease' | string;
  locality?: string;
  road_corridor?: string;
  taluk?: string;
  district?: string;
  plot_number: string;
  length_ft?: number;
  width_ft?: number;
  area_sqft: number;
  facing: 'North' | 'East' | 'West' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West' | string;
  approval_status?: string;
  price_per_sqft?: number;
  total_price_lakhs?: number;
  price?: number;
  currency?: string;
  status: 'Available' | 'Booked' | 'Sold' | 'Blocked' | string;
  listing_visibility?: 'Publish to Website & CRM' | 'CRM Only' | 'Draft' | string;
  amenities?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  video_url?: string;
  latitude?: string;
  longitude?: string;
  primary_image_url?: string;
  gallery_images?: string[];
  created_at?: string;
}

export interface GalleryItem {
  id: string;
  project_id?: string;
  title: string;
  category: string;
  image_url: string;
  created_at: string;
}

export interface Settings {
  company_name: string;
  phone_primary: string;
  phone_whatsapp: string;
  email_primary: string;
  office_address: string;
  working_hours: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: 'Published' | 'Draft';
  read_time: string;
  image_url?: string;
  banner_image?: string;
  excerpt: string;
  content: string;
  seo_title?: string;
  seo_description?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteVisit {
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

export interface PromotionalPopup {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  badge_tag?: string;
  banner_image?: string;
  highlights?: string;
  cta_text?: string;
  cta_action?: string;
  whatsapp_number?: string;
  start_date?: string | null;
  end_date?: string | null;
  layout_style?: string;
  display_delay?: string;
  show_frequency?: string;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}
