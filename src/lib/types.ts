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
  project_interest?: string;
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
  site_visit_time?: string | null;
  site_visit_pickup_needed?: boolean;
  pickup_needed?: boolean;
  pickup_location?: string;
  next_follow_up_date?: string | null;
  next_follow_up_time?: string | null;
  notes: CrmNote[];
  created_at: string;
  updated_at: string;
}

export interface LandmarkItem {
  landmark: string;
  category?: 'Worship' | 'Education' | 'Transit' | 'Healthcare' | 'Shopping' | 'Workplace' | string;
  distance: string;
  time: string;
  map_url?: string;
}

export interface AmenityItem {
  icon: string;
  title: string;
  desc: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  title?: string;
  tagline: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Sold Out' | 'Draft' | string;
  location?: string;
  location_city: string;
  location_area: string;
  map_url?: string;
  google_maps_embed_url?: string;
  total_acres?: number;
  total_extent_acres?: number;
  total_plots?: number;
  total_plots_count?: number;
  available_plots?: number;
  available_plots_count?: number;
  price_starting_lakhs?: number;
  plot_size_range?: string;
  price_range?: string;
  is_featured?: boolean;
  hero_image?: string;
  banner_image?: string;
  video_url?: string;
  brochure_url?: string;
  dtcp_number?: string;
  rera_number?: string;
  description?: string;
  highlights?: string[];
  amenities?: AmenityItem[];
  nearby_landmarks?: LandmarkItem[];
  gallery_images?: string[];
  latitude?: string;
  longitude?: string;
  plots?: Plot[];
  created_at?: string;
  updated_at?: string;
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
  dimension?: string;
  dimension_str?: string;
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
  latitude?: string;
  longitude?: string;
  primary_image_url?: string;
  gallery_images?: string[];
  video_url?: string;
  video_urls?: string[];
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
  logo_url?: string;
  primary_color?: string;
  theme_mode?: 'light' | 'dark';
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
  custom_url?: string;
  start_date?: string | null;
  end_date?: string | null;
  layout_style?: string;
  display_delay?: string;
  show_frequency?: string;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface HeroBanner {
  id: string;
  title?: string;
  subtitle?: string;
  badge_text?: string;
  image_url: string;
  mobile_image_url?: string;
  banner_type: 'graphic' | 'overlay'; // 'graphic' = zero-crop flyer with text inside; 'overlay' = photo with HTML text
  // Two Buttons Support
  button1_text?: string;
  button1_link?: string;
  button1_active?: boolean;
  button2_text?: string;
  button2_link?: string;
  button2_active?: boolean;
  // Legacy / Direct Link
  button_text?: string;
  button_link?: string;
  project_name?: string;
  active: boolean;
  order: number;
}
