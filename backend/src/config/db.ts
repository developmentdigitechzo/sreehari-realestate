import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sree_hari_realty';

let pool: Pool | null = null;
let isPostgresAvailable = false;

// Local JSON fallback storage for zero-dependency instant testing
const FALLBACK_DB_PATH = path.join(__dirname, '../../data/local_db.json');

interface FallbackDB {
  users: any[];
  projects: any[];
  plots: any[];
  amenities: any[];
  project_amenities: any[];
  project_images: any[];
  leads: any[];
  gallery: any[];
  blogs?: any[];
  site_visits?: any[];
  popups?: any[];
  settings: Record<string, any>;
}

function ensureFallbackDB(): FallbackDB {
  const dir = path.dirname(FALLBACK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    const initial: FallbackDB = {
      users: [],
      projects: [],
      plots: [],
      amenities: [],
      project_amenities: [],
      project_images: [],
      leads: [],
      gallery: [],
      blogs: [],
      site_visits: [],
      popups: [],
      settings: {}
    };
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.blogs) parsed.blogs = [];
    if (!parsed.site_visits) parsed.site_visits = [];
    if (!parsed.popups) parsed.popups = [];
    return parsed;
  } catch {
    return {
      users: [],
      projects: [],
      plots: [],
      amenities: [],
      project_amenities: [],
      project_images: [],
      leads: [],
      gallery: [],
      blogs: [],
      site_visits: [],
      popups: [],
      settings: {}
    };
  }
}

function saveFallbackDB(data: FallbackDB) {
  const dir = path.dirname(FALLBACK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2));
}

export async function initDatabase() {
  try {
    // Attempt connecting to the target database
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000
    });

    let client;
    try {
      client = await pool.connect();
    } catch (connErr: any) {
      // If DB does not exist, connect to default 'postgres' db and create it
      if (connErr.message && connErr.message.includes('does not exist')) {
        const rootConnStr = connectionString.replace(/\/sree_hari_realty(\?.*)?$/, '/postgres$1');
        const rootPool = new Pool({ connectionString: rootConnStr, connectionTimeoutMillis: 3000 });
        const rootClient = await rootPool.connect();
        await rootClient.query('CREATE DATABASE sree_hari_realty;');
        rootClient.release();
        await rootPool.end();
        console.log('✓ Created PostgreSQL database "sree_hari_realty"');

        // Re-try connection
        client = await pool.connect();
      } else {
        throw connErr;
      }
    }

    isPostgresAvailable = true;
    console.log('✓ Successfully connected to PostgreSQL database');

    // Execute schema safely
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
      try {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schemaSql);
      } catch (schemaErr: any) {
        console.warn('Note on schema.sql:', schemaErr.message);
      }

      // Auto-migrate additional columns & tables independently
      const alterQueries = [
        // Blogs extra fields
        `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS image_url TEXT;`,
        `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);`,
        `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_description TEXT;`,

        // Leads extra fields
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage VARCHAR(100) DEFAULT 'New Lead';`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(100) DEFAULT 'New Lead';`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Warm';`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS plot_id VARCHAR(255);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS plot_name VARCHAR(255);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS plot_description TEXT;`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget VARCHAR(100);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS facing_preference VARCHAR(50);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(150);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS site_visit_date VARCHAR(50);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS site_visit_time VARCHAR(50);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS site_visit_pickup_needed BOOLEAN DEFAULT false;`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up_date VARCHAR(50);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;`,

        // Site Visits Table
        `CREATE TABLE IF NOT EXISTS site_visits (
            id VARCHAR(36) PRIMARY KEY,
            lead_id VARCHAR(36),
            project_id VARCHAR(36),
            project_name VARCHAR(255),
            customer_name VARCHAR(150) NOT NULL,
            customer_phone VARCHAR(50) NOT NULL,
            customer_email VARCHAR(255),
            visit_date VARCHAR(50) NOT NULL,
            visit_time VARCHAR(50) DEFAULT '10:00 AM',
            preferred_plot_size VARCHAR(100),
            pickup_needed BOOLEAN DEFAULT false,
            pickup_location VARCHAR(255),
            status VARCHAR(50) DEFAULT 'Requested',
            assigned_staff VARCHAR(150) DEFAULT 'Sales Team',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

        // Popups Table
        `CREATE TABLE IF NOT EXISTS popups (
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
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

        // Users & Staff extra fields
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["ALL"]'::jsonb;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_plain VARCHAR(255) DEFAULT 'AdminPassword@2026';`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '+91 98424 01991';`,
        `UPDATE users SET password_plain = 'AdminPassword@2026' WHERE password_plain IS NULL;`,
        `UPDATE users SET phone = '+91 98424 01991' WHERE phone IS NULL;`,
        `UPDATE users SET permissions = '["ALL"]'::jsonb, role = 'super_admin', password_plain = 'AdminPassword@2026', phone = '+91 98424 01991' WHERE email = 'admin@sreeharirealty.com';`,

        // Projects extra fields
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS dtcp_number VARCHAR(255);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS rera_number VARCHAR(255);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS available_plots_count INT DEFAULT 0;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude VARCHAR(50);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude VARCHAR(50);`,

        // Plots extra fields
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS dimension VARCHAR(100);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS latitude VARCHAR(50);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS longitude VARCHAR(50);`,

        // High Performance Production Indexes
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
        `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
        `CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);`,
        `CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`,
        `CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);`,
        `CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_plots_project_id ON plots(project_id);`,
        `CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);`,
        `CREATE INDEX IF NOT EXISTS idx_plots_plot_number ON plots(plot_number);`,
        `CREATE INDEX IF NOT EXISTS idx_plots_created_at ON plots(created_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_project_id ON leads(project_id);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_site_visits_lead_id ON site_visits(lead_id);`,
        `CREATE INDEX IF NOT EXISTS idx_site_visits_project_id ON site_visits(project_id);`,
        `CREATE INDEX IF NOT EXISTS idx_site_visits_status ON site_visits(status);`,
        `CREATE INDEX IF NOT EXISTS idx_site_visits_phone ON site_visits(customer_phone);`,
        `CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);`,
        `CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_popups_status ON popups(status);`,
        `CREATE INDEX IF NOT EXISTS idx_popups_created_at ON popups(created_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);`,
        `CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery(sort_order);`,
        `CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);`,
        `CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);`,
        `CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);`
      ];

      for (const q of alterQueries) {
        try {
          await client.query(q);
        } catch (alterErr: any) {
          console.warn('Migration step warning:', alterErr.message);
        }
      }

      console.log('✓ Database schema verified and updated');
    }
    client.release();
  } catch (err: any) {
    console.warn('! PostgreSQL connection not active or reachable (' + err.message + ')');
    console.log('→ Operating with resilient file-backed persistent database at data/local_db.json');
    isPostgresAvailable = false;
    ensureFallbackDB();
  }
}

export const db = {
  isPostgres: () => isPostgresAvailable,
  getFallbackData: () => ensureFallbackDB(),
  saveFallbackData: (data: FallbackDB) => saveFallbackDB(data),

  async query(text: string, params: any[] = []): Promise<QueryResult<any> | { rows: any[]; rowCount: number }> {
    if (isPostgresAvailable && pool) {
      try {
        return await pool.query(text, params);
      } catch (error: any) {
        console.error('PostgreSQL query error during:', text, 'Message:', error?.message);
      }
    }

    // High performance fallback handler for standard queries
    const store = ensureFallbackDB();
    const cleanText = text.trim();
    const upper = cleanText.toUpperCase();

    if (upper.startsWith('SELECT')) {
      if (upper.includes('FROM USERS')) {
        let rows = [...store.users];
        if (params.length > 0 && upper.includes('WHERE EMAIL = $1')) {
          rows = rows.filter(u => u.email === params[0]);
        } else if (params.length > 0 && upper.includes('WHERE ID = $1')) {
          rows = rows.filter(u => u.id === params[0]);
        }
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM PROJECTS')) {
        let rows = [...store.projects];
        if (params.length > 0 && upper.includes('WHERE SLUG = $1')) {
          rows = rows.filter(p => p.slug === params[0]);
        } else if (params.length > 0 && upper.includes('WHERE ID = $1')) {
          rows = rows.filter(p => p.id === params[0]);
        } else if (upper.includes('WHERE STATUS = $1')) {
          rows = rows.filter(p => p.status.toLowerCase() === params[0].toLowerCase());
        }
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM PLOTS')) {
        let rows = [...store.plots];
        if (params.length > 0 && upper.includes('WHERE PROJECT_ID = $1')) {
          rows = rows.filter(p => p.project_id === params[0]);
        } else if (params.length > 0 && upper.includes('WHERE ID = $1')) {
          rows = rows.filter(p => p.id === params[0]);
        }
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM LEADS')) {
        let rows = [...store.leads];
        if (params.length > 0 && upper.includes('WHERE ID = $1')) {
          rows = rows.filter(l => l.id === params[0]);
        }
        // sort descending by created_at
        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM SITE_VISITS')) {
        let rows = [...(store.site_visits || [])];
        if (params.length > 0 && upper.includes('WHERE ID = $1')) {
          rows = rows.filter(v => v.id === params[0]);
        }
        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM POPUPS')) {
        let rows = [...(store.popups || [])];
        if (upper.includes("WHERE STATUS = 'ACTIVE'")) {
          rows = rows.filter(p => (p.status || 'Active') === 'Active');
        } else if (params.length > 0 && upper.includes('WHERE ID = $1')) {
          rows = rows.filter(p => p.id === params[0]);
        }
        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM BLOGS')) {
        let rows = [...(store.blogs || [])];
        if (params.length > 0 && upper.includes('WHERE SLUG = $1')) {
          rows = rows.filter(b => b.slug === params[0]);
        } else if (params.length > 0 && upper.includes('WHERE ID = $1')) {
          rows = rows.filter(b => b.id === params[0]);
        }
        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM GALLERY')) {
        let rows = [...store.gallery];
        rows.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM SETTINGS')) {
        const rows = Object.entries(store.settings).map(([key, val]) => ({
          key,
          value: typeof val === 'object' ? JSON.stringify(val) : String(val),
          updated_at: new Date().toISOString()
        }));
        return { rows, rowCount: rows.length };
      }

      if (upper.includes('FROM AMENITIES')) {
        return { rows: store.amenities, rowCount: store.amenities.length };
      }
    }

    return { rows: [], rowCount: 0 };
  }
};
