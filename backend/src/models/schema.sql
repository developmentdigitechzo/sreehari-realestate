-- PostgreSQL Schema for Sree Hari Realty Promoters
-- Phase 1 Land & Plot Real Estate Platform
-- Complete Production Database DDL

-- 1. USERS & STAFF ACCESS CONTROL
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    password_plain VARCHAR(255) DEFAULT 'AdminPassword@2026',
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '["ALL"]'::jsonb,
    status VARCHAR(50) DEFAULT 'Active',
    phone VARCHAR(50) DEFAULT '+91 98424 01991',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROJECTS (COMMUNITIES / PLOTTED TOWNSHIPS)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tagline VARCHAR(255),
    description TEXT,
    location_area VARCHAR(255) NOT NULL,
    location_city VARCHAR(100) DEFAULT 'Trichy',
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    total_extent_acres DECIMAL(10, 2),
    total_plots_count INT DEFAULT 0,
    available_plots_count INT DEFAULT 0,
    plot_size_range VARCHAR(100),
    price_range VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Ongoing', -- Upcoming, Ongoing, Completed, Sold Out, Draft
    is_featured BOOLEAN DEFAULT false,
    banner_image TEXT,
    video_url TEXT,
    brochure_url TEXT,
    google_maps_embed_url TEXT,
    dtcp_number VARCHAR(255),
    rera_number VARCHAR(255),
    gallery_images JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    nearby_landmarks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PLOTS INVENTORY
CREATE TABLE IF NOT EXISTS plots (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    plot_number VARCHAR(50) NOT NULL,
    type VARCHAR(100) DEFAULT 'Plot',
    category VARCHAR(50) DEFAULT 'Sale',
    locality VARCHAR(255),
    road_corridor VARCHAR(255),
    taluk VARCHAR(100) DEFAULT 'Central',
    district VARCHAR(100) DEFAULT 'City',
    length_ft DECIMAL(10, 2),
    width_ft DECIMAL(10, 2),
    dimension_str VARCHAR(100),
    dimension VARCHAR(100),
    area_sqft DECIMAL(10, 2),
    facing VARCHAR(50) DEFAULT 'North',
    approval_status VARCHAR(100) DEFAULT 'DTCP Approved',
    price_per_sqft DECIMAL(10, 2),
    total_price_lakhs DECIMAL(14, 2),
    price DECIMAL(14, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'Available', -- Available, Booked, Sold, Under Discussion
    listing_visibility VARCHAR(100) DEFAULT 'Publish to Website & CRM',
    amenities TEXT,
    description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    video_url TEXT,
    video_urls JSONB DEFAULT '[]'::jsonb,
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    primary_image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. AMENITIES MASTER
CREATE TABLE IF NOT EXISTS amenities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_key VARCHAR(50) NOT NULL,
    description TEXT
);

-- 5. PROJECT AMENITIES JUNCTION
CREATE TABLE IF NOT EXISTS project_amenities (
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amenity_id VARCHAR(36) NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, amenity_id)
);

-- 6. PROJECT IMAGES
CREATE TABLE IF NOT EXISTS project_images (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    category VARCHAR(50) DEFAULT 'Layout',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. LEADS & CRM PIPELINE
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE SET NULL,
    plot_id VARCHAR(255),
    plot_name VARCHAR(255),
    plot_description TEXT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    preferred_plot_size VARCHAR(100),
    budget VARCHAR(100),
    facing_preference VARCHAR(50),
    message TEXT,
    source VARCHAR(100) DEFAULT 'Website Form',
    stage VARCHAR(100) DEFAULT 'New Lead',
    status VARCHAR(100) DEFAULT 'New Lead',
    priority VARCHAR(50) DEFAULT 'Warm',
    assigned_to VARCHAR(150) DEFAULT 'Sales Team',
    site_visit_date VARCHAR(50),
    site_visit_time VARCHAR(50),
    site_visit_pickup_needed BOOLEAN DEFAULT false,
    next_follow_up_date VARCHAR(50),
    notes JSONB DEFAULT '[]'::jsonb,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SITE VISITS MANAGEMENT
CREATE TABLE IF NOT EXISTS site_visits (
    id VARCHAR(36) PRIMARY KEY,
    lead_id VARCHAR(36),
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    visit_date VARCHAR(50) NOT NULL,
    visit_time VARCHAR(50) DEFAULT '10:00 AM',
    preferred_plot_size VARCHAR(100),
    pickup_needed BOOLEAN DEFAULT false,
    pickup_location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Requested', -- Requested, Confirmed, Completed, Cancelled
    assigned_staff VARCHAR(150) DEFAULT 'Sales Team',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PROMOTIONAL & FESTIVE POPUPS
CREATE TABLE IF NOT EXISTS popups (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Festival',
    badge_tag VARCHAR(100) DEFAULT 'FESTIVE OFFER',
    banner_image TEXT,
    highlights TEXT,
    cta_text VARCHAR(150) DEFAULT 'Claim Offer on WhatsApp',
    cta_action VARCHAR(50) DEFAULT 'whatsapp',
    whatsapp_number VARCHAR(50) DEFAULT '+91 98424 01991',
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    layout_style VARCHAR(50) DEFAULT 'Auto Detect',
    display_delay VARCHAR(50) DEFAULT '3s',
    show_frequency VARCHAR(50) DEFAULT 'Once per Session',
    status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. GALLERY SHOWCASE
CREATE TABLE IF NOT EXISTS gallery (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. GENERAL PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. BLOGS & MARKET INSIGHTS
CREATE TABLE IF NOT EXISTS blogs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) DEFAULT 'Market Trends',
    author VARCHAR(100) DEFAULT 'Sree Hari Realty Editorial',
    status VARCHAR(50) DEFAULT 'Published',
    read_time VARCHAR(50) DEFAULT '4 min read',
    banner_image TEXT,
    image_url TEXT,
    excerpt TEXT,
    content TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES FOR MAXIMUM PRODUCTION PERFORMANCE
-- ==========================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Plots
CREATE INDEX IF NOT EXISTS idx_plots_project_id ON plots(project_id);
CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);
CREATE INDEX IF NOT EXISTS idx_plots_plot_number ON plots(plot_number);
CREATE INDEX IF NOT EXISTS idx_plots_created_at ON plots(created_at DESC);

-- Leads & CRM
CREATE INDEX IF NOT EXISTS idx_leads_project_id ON leads(project_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Site Visits
CREATE INDEX IF NOT EXISTS idx_site_visits_lead_id ON site_visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_project_id ON site_visits(project_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_status ON site_visits(status);
CREATE INDEX IF NOT EXISTS idx_site_visits_phone ON site_visits(customer_phone);
CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at DESC);

-- Popups
CREATE INDEX IF NOT EXISTS idx_popups_status ON popups(status);
CREATE INDEX IF NOT EXISTS idx_popups_created_at ON popups(created_at DESC);

-- Gallery
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery(sort_order);

-- Blogs
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
