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
        `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS image_url TEXT;`,
        `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);`,
        `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_description TEXT;`,
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
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up_date VARCHAR(50);`,
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;`,
        `CREATE TABLE IF NOT EXISTS site_visits (
            id VARCHAR(36) PRIMARY KEY,
            lead_id VARCHAR(36),
            project_id VARCHAR(36),
            project_name VARCHAR(255),
            customer_name VARCHAR(150) NOT NULL,
            customer_phone VARCHAR(20) NOT NULL,
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
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["ALL"]'::jsonb;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_plain VARCHAR(255) DEFAULT 'AdminPassword@2026';`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '+91 98424 01991';`,
        `UPDATE users SET password_plain = 'AdminPassword@2026' WHERE password_plain IS NULL;`,
        `UPDATE users SET phone = '+91 98424 01991' WHERE phone IS NULL;`,
        `UPDATE users SET permissions = '["ALL"]'::jsonb, role = 'super_admin', password_plain = 'AdminPassword@2026', phone = '+91 98424 01991' WHERE email = 'admin@sreeharirealty.com';`
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
