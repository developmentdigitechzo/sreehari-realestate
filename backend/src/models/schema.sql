-- PostgreSQL Schema for Sree Hari Realty Promoters
-- Phase 1 Land & Plot Real Estate Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tagline VARCHAR(255),
    description TEXT,
    location_area VARCHAR(255) NOT NULL,
    location_city VARCHAR(100) DEFAULT 'Trichy',
    total_extent_acres DECIMAL(10, 2),
    total_plots_count INT DEFAULT 0,
    plot_size_range VARCHAR(100),
    price_range VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Ongoing', -- Upcoming, Ongoing, Completed, Sold Out, Draft
    is_featured BOOLEAN DEFAULT false,
    banner_image TEXT,
    brochure_url TEXT,
    google_maps_embed_url TEXT,
    nearby_landmarks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plots (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255),
    slug VARCHAR(255),
    type VARCHAR(100) DEFAULT 'Plot',
    category VARCHAR(50) DEFAULT 'Sale',
    locality VARCHAR(255),
    road_corridor VARCHAR(255),
    taluk VARCHAR(100) DEFAULT 'Central',
    district VARCHAR(100) DEFAULT 'City',
    plot_number VARCHAR(50) NOT NULL,
    length_ft DECIMAL(10, 2),
    width_ft DECIMAL(10, 2),
    dimension_str VARCHAR(100),
    area_sqft DECIMAL(10, 2),
    facing VARCHAR(50) DEFAULT 'North',
    approval_status VARCHAR(100) DEFAULT 'DTCP Approved',
    price_per_sqft DECIMAL(10, 2),
    total_price_lakhs DECIMAL(14, 2),
    price DECIMAL(14, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'Available',
    listing_visibility VARCHAR(100) DEFAULT 'Publish to Website & CRM',
    amenities TEXT,
    description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    video_url TEXT,
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    primary_image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS amenities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_key VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS project_amenities (
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amenity_id VARCHAR(36) NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS project_images (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    category VARCHAR(50) DEFAULT 'Layout', -- Banner, Layout, Road, Gate, Amenity, Aerial
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE SET NULL,
    plot_id VARCHAR(255),
    plot_name VARCHAR(255),
    plot_description TEXT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    preferred_plot_size VARCHAR(100),
    budget VARCHAR(100),
    facing_preference VARCHAR(50),
    message TEXT,
    source VARCHAR(50) DEFAULT 'Website Form',
    stage VARCHAR(100) DEFAULT 'New Lead',
    status VARCHAR(100) DEFAULT 'New Lead',
    priority VARCHAR(50) DEFAULT 'Warm',
    assigned_to VARCHAR(150) DEFAULT 'Sales Team',
    site_visit_date VARCHAR(50),
    next_follow_up_date VARCHAR(50),
    notes JSONB DEFAULT '[]'::jsonb,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General', -- Roads, Entrance Gate, Layouts, Green Parks, Aerial Views
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) DEFAULT 'Market Trends',
    author VARCHAR(100) DEFAULT 'Sree Hari Realty Editorial',
    status VARCHAR(50) DEFAULT 'Published',
    read_time VARCHAR(50) DEFAULT '4 min read',
    banner_image TEXT,
    excerpt TEXT,
    content TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_plots_project_id ON plots(project_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
