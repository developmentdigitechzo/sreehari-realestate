import { Pool, PoolConfig, QueryResult } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env from multiple standard locations (cwd, backend/, project root) with override
dotenv.config({ override: true });
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });
dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });
dotenv.config({ path: path.join(process.cwd(), 'backend/.env'), override: true });

export const dbDiagnostics = {
  isPostgres: false,
  connectionError: null as string | null,
  activeConfig: {} as any,
  connectedAt: null as string | null,
  tableCounts: {} as Record<string, number>,
  connectionAttempts: [] as Array<{ method: string; error: string }>
};

function getPoolConfig(): PoolConfig {
  const isLinux = process.platform === 'linux';
  const defaultHost = isLinux ? '/var/run/postgresql' : '127.0.0.1';
  let host = process.env.PGHOST || process.env.DB_HOST || defaultHost;
  if (host === 'localhost') {
    host = isLinux ? '/var/run/postgresql' : '127.0.0.1';
  }
  const port = parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10);
  const user = process.env.PGUSER || process.env.DB_USER || 'sreeharirealty_client_db';
  const password = process.env.PGPASSWORD || process.env.DB_PASSWORD || 'Realestate@2026!#';
  const database = process.env.PGDATABASE || process.env.DB_NAME || 'sreeharirealty_db';

  const config: PoolConfig = {
    host,
    port,
    user,
    password,
    database,
    connectionTimeoutMillis: 7000,
  };

  if (process.env.DB_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

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
  media_library?: any[];
  settings: Record<string, any>;
}

export const DEFAULT_MEDIA_LIBRARY = [
  {
    id: 'media-park-avenue-aerial-walkthrough',
    fileName: 'park-avenue-aerial-walkthrough.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-residential-suburb-with-houses-and-gardens-41551-large.mp4',
    type: 'video',
    title: 'Park Avenue Aerial Walkthrough Drone Video',
    size_bytes: 4890000,
    created_at: '2026-10-15T10:00:00.000Z'
  },
  {
    id: 'media-youtube-sreehari-promo',
    fileName: 'youtube-sreehari-promo.url',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'video',
    title: 'Sree Hari Realty Showcase (YouTube)',
    size_bytes: 0,
    created_at: '2026-10-15T10:00:00.000Z'
  },
  {
    id: 'media-hero-banner-park-avenue',
    fileName: 'hero-banner-park-avenue.jpg',
    url: '/project_park_avenue_new.jpg',
    type: 'image',
    title: 'Park Avenue Master Layout Banner',
    size_bytes: 350000,
    created_at: '2026-10-15T10:00:00.000Z'
  },
  {
    id: 'media-site-infrastructure-blacktop',
    fileName: 'site-infrastructure-blacktop.jpg',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    title: 'Avenue Blacktop Road & Tree Plantation',
    size_bytes: 520000,
    created_at: '2026-10-15T10:00:00.000Z'
  },
  {
    id: 'media-villa-plots-development',
    fileName: 'villa-plots-development.jpg',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    title: 'Individual Villa Plot Boundary Demarcation',
    size_bytes: 610000,
    created_at: '2026-10-15T10:00:00.000Z'
  }
];

export const DEFAULT_PROJECT_AMENITIES: Record<string, any[]> = {
  'proj-park-avenue': [
    { icon: 'ShieldCheck', title: 'Grand Entrance & Security', desc: 'Monumental arch entrance with manned security, CCTV provision, and gated boundary.' },
    { icon: 'Milestone', title: 'Wide Blacktop Tar Roads', desc: 'Engineered heavy-duty asphalt roads designed for seamless two-way vehicular flow.' },
    { icon: 'Droplets', title: 'Sweet Groundwater', desc: 'Natural sweet potable water source with individual pipe provisions to plot boundaries.' },
    { icon: 'Trees', title: "Landscaped Children's Park", desc: 'Dedicated open space reserve with children play equipment and green avenue plantations.' },
    { icon: 'Sun', title: 'Electricity & Streetlights', desc: 'High-voltage electric lines and bright LED streetlighting across all layout avenues.' },
    { icon: 'Award', title: 'Instant Spot Registration', desc: '100% clear parent title deeds with DTCP & TNRERA compliance and fast spot registration.' }
  ],
  'proj-sri-amman-nagar': [
    { icon: 'ShieldCheck', title: '5-Year Maintenance & Security', desc: 'Unmatched 5-year maintenance and round-the-clock safety guarantee provided for all residents.' },
    { icon: 'Milestone', title: '33 Ft & 24 Ft Wide Tar Roads', desc: 'Paved high-grade tar roads with proper road camber and stormwater channel drains.' },
    { icon: 'Droplets', title: 'Cauvery Sweet Drinking Water', desc: 'Direct piped Cauvery potable drinking water connection provided throughout the layout.' },
    { icon: 'Fence', title: 'Compound Wall & Entrance Gate', desc: 'Secured peripheral compound wall with a welcoming gate for complete township protection.' },
    { icon: 'Sun', title: 'EB Power & Bright Streetlights', desc: 'Underground electricity connections and LED street lighting illuminating all avenues.' },
    { icon: 'Award', title: 'ISO 9001:2008 & Corporation Limits', desc: 'Inside Trichy City Corporation with ISO 9001:2008 quality certified layout execution.' }
  ],
  'proj-aishwarya-nagar': [
    { icon: 'Droplets', title: 'Sweet Potable Water', desc: 'Sweet groundwater available throughout all seasons at shallow depth.' },
    { icon: 'Fence', title: 'Protective Boundary Walls', desc: 'Sturdy perimeter fencing and concrete boundary posts securing every plot.' },
    { icon: 'Award', title: 'Bank Loan Eligible', desc: 'Clear legal title certificates accepted by all major nationalized banks.' },
    { icon: 'Milestone', title: 'Direct Road Access', desc: 'Direct connectivity to Thirumayam and Pudukkottai Highway corridors.' }
  ]
};

let memoryFallbackDB: FallbackDB | null = null;
let isWritingFallback = false;
let pendingFallbackWrite: FallbackDB | null = null;

function ensureFallbackDB(): FallbackDB {
  if (memoryFallbackDB) {
    return memoryFallbackDB;
  }

  const dir = path.dirname(FALLBACK_DB_PATH);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
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
      media_library: [...DEFAULT_MEDIA_LIBRARY],
      settings: {}
    };
    try {
      fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initial));
    } catch {}
    memoryFallbackDB = initial;
    return initial;
  }
  try {
    const raw = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.blogs) parsed.blogs = [];
    if (!parsed.site_visits) parsed.site_visits = [];
    if (!parsed.popups) parsed.popups = [];
    if (parsed.media_library === undefined) {
      parsed.media_library = [...DEFAULT_MEDIA_LIBRARY];
    }

    // Ensure fallback projects have amenities populated
    if (Array.isArray(parsed.projects)) {
      for (const p of parsed.projects) {
        if (!p.amenities || !Array.isArray(p.amenities) || p.amenities.length === 0) {
          const defaults = DEFAULT_PROJECT_AMENITIES[p.id] || DEFAULT_PROJECT_AMENITIES[`proj-${p.slug}`];
          if (defaults) {
            p.amenities = defaults;
          }
        }
      }
    }
    memoryFallbackDB = parsed;
    return parsed;
  } catch {
    const fallbackEmpty: FallbackDB = {
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
    memoryFallbackDB = fallbackEmpty;
    return fallbackEmpty;
  }
}

function saveFallbackDB(data: FallbackDB) {
  memoryFallbackDB = data;

  if (isWritingFallback) {
    pendingFallbackWrite = data;
    return;
  }

  isWritingFallback = true;
  const dir = path.dirname(FALLBACK_DB_PATH);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }

  fs.writeFile(FALLBACK_DB_PATH, JSON.stringify(data), 'utf-8', (err) => {
    isWritingFallback = false;
    if (err) {
      console.warn('Async fallback write error:', err.message);
    }
    if (pendingFallbackWrite) {
      const nextData = pendingFallbackWrite;
      pendingFallbackWrite = null;
      saveFallbackDB(nextData);
    }
  });
}

export async function initDatabase() {
  const baseConfig = getPoolConfig();
  const baseUser = process.env.PGUSER || process.env.DB_USER || baseConfig.user || 'sreeharirealty_client_db';
  const basePassword = process.env.PGPASSWORD || process.env.DB_PASSWORD || baseConfig.password || 'Realestate@2026!#';
  const baseDatabase = process.env.PGDATABASE || process.env.DB_NAME || baseConfig.database || 'sreeharirealty_db';
  const basePort = parseInt(process.env.PGPORT || process.env.DB_PORT || String(baseConfig.port || 5432), 10);
  const baseHost = process.env.PGHOST || process.env.DB_HOST || baseConfig.host || (process.platform === 'linux' ? '/var/run/postgresql' : '127.0.0.1');
  const connectionString = process.env.DATABASE_URL;

  // Build candidate configurations in priority order:
  const candidateConfigs: Array<{ label: string; config: PoolConfig }> = [];

  // Determine potential usernames (user-specified and cPanel base user)
  const usersToTry = [baseUser];
  const cpanelUser = baseUser.includes('_') ? baseUser.split('_')[0] : 'sreeharirealty';
  if (!usersToTry.includes(cpanelUser)) {
    usersToTry.push(cpanelUser);
  }

  // Socket locations to test
  const socketPaths = ['/var/run/postgresql', '/tmp'];

  // Priority 1: Unix Domain Sockets (standard cPanel Linux IPC)
  for (const sPath of socketPaths) {
    for (const u of usersToTry) {
      candidateConfigs.push({
        label: `Unix Socket ${sPath} (user: ${u})`,
        config: { host: sPath, port: basePort, user: u, password: basePassword, database: baseDatabase, connectionTimeoutMillis: 5000 }
      });
      // Also try peer auth without password on local socket
      candidateConfigs.push({
        label: `Unix Socket ${sPath} (peer auth, user: ${u})`,
        config: { host: sPath, port: basePort, user: u, database: baseDatabase, connectionTimeoutMillis: 5000 }
      });
    }
  }

  // Priority 2: Default System Unix Socket (no host property)
  for (const u of usersToTry) {
    candidateConfigs.push({
      label: `Default Local Socket (user: ${u})`,
      config: { port: basePort, user: u, password: basePassword, database: baseDatabase, connectionTimeoutMillis: 5000 }
    });
  }

  // Priority 3: DATABASE_URL if explicitly given
  if (connectionString) {
    candidateConfigs.push({
      label: 'DATABASE_URL (SSL on)',
      config: { connectionString, connectionTimeoutMillis: 5000, ssl: { rejectUnauthorized: false } }
    });
    candidateConfigs.push({
      label: 'DATABASE_URL (SSL off)',
      config: { connectionString, connectionTimeoutMillis: 5000 }
    });
  }

  // Priority 4: TCP with SSL
  for (const u of usersToTry) {
    candidateConfigs.push({
      label: `TCP ${baseHost}:${basePort} (with SSL, user: ${u})`,
      config: { host: baseHost, port: basePort, user: u, password: basePassword, database: baseDatabase, connectionTimeoutMillis: 5000, ssl: { rejectUnauthorized: false } }
    });
  }

  // Priority 5: TCP without SSL
  for (const u of usersToTry) {
    candidateConfigs.push({
      label: `TCP ${baseHost}:${basePort} (SSL off, user: ${u})`,
      config: { host: baseHost, port: basePort, user: u, password: basePassword, database: baseDatabase, connectionTimeoutMillis: 5000 }
    });
  }

  const attemptLogs: Array<{ method: string; error: string }> = [];

  try {
    let client: any = null;
    let activePool: Pool | null = null;
    let activeConfig: PoolConfig | null = null;
    let activeLabel = '';
    let lastErr: any = null;

    for (const candidate of candidateConfigs) {
      let testPool: Pool | null = null;
      try {
        testPool = new Pool(candidate.config);
        client = await testPool.connect();
        activePool = testPool;
        activeConfig = candidate.config;
        activeLabel = candidate.label;
        console.log(`✓ Successfully established PostgreSQL connection via ${candidate.label}`);
        break;
      } catch (connErr: any) {
        lastErr = connErr;
        attemptLogs.push({ method: candidate.label, error: connErr.message });
        if (testPool) {
          try { await testPool.end(); } catch {}
        }

        // If DB does not exist in local development, connect to default 'postgres' db and create it
        if (
          process.env.NODE_ENV !== 'production' &&
          connErr.message &&
          connErr.message.includes('does not exist') &&
          baseConfig.connectionString
        ) {
          try {
            const rootConnStr = baseConfig.connectionString.replace(/\/sree_hari_realty(\?.*)?$/, '/postgres$1');
            const rootPool = new Pool({ connectionString: rootConnStr, connectionTimeoutMillis: 3000 });
            const rootClient = await rootPool.connect();
            await rootClient.query('CREATE DATABASE sree_hari_realty;');
            rootClient.release();
            await rootPool.end();
            console.log('✓ Created PostgreSQL database "sree_hari_realty"');

            testPool = new Pool(candidate.config);
            client = await testPool.connect();
            activePool = testPool;
            activeConfig = candidate.config;
            activeLabel = candidate.label;
            break;
          } catch {}
        }
      }
    }

    if (!client || !activePool || !activeConfig) {
      throw (lastErr || new Error('All PostgreSQL connection strategies exhausted.'));
    }

    pool = activePool;
    isPostgresAvailable = true;
    dbDiagnostics.isPostgres = true;
    dbDiagnostics.connectionError = null;
    dbDiagnostics.activeConfig = {
      method: activeLabel,
      host: activeConfig.host || (activeConfig.connectionString ? 'via DATABASE_URL' : 'unix-domain-socket'),
      port: activeConfig.port || 5432,
      user: activeConfig.user || 'configured',
      database: activeConfig.database || 'configured',
      ssl: Boolean(activeConfig.ssl)
    };
    dbDiagnostics.connectedAt = new Date().toISOString();
    console.log(`✓ Connected to PostgreSQL (${dbDiagnostics.activeConfig.database} via ${activeLabel})`);

    // Execute schema safely
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
      try {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schemaSql);
      } catch (schemaErr: any) {
        console.warn('Note on schema.sql execution:', schemaErr.message);
      }

      // Auto-migrate additional columns & tables independently
      const alterQueries = [
        // Projects extra fields
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_description TEXT;`,

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
        `ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up_time VARCHAR(50);`,
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

        // Popups Table & Columns
        `CREATE TABLE IF NOT EXISTS popups (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255),
            category VARCHAR(100) DEFAULT '',
            badge_tag VARCHAR(100) DEFAULT '',
            banner_image TEXT,
            highlights TEXT,
            cta_text VARCHAR(150) DEFAULT 'Claim Offer on WhatsApp',
            cta_action VARCHAR(50) DEFAULT 'whatsapp',
            whatsapp_number VARCHAR(50) DEFAULT '+91 73737 13559',
            custom_url TEXT,
            start_date VARCHAR(50),
            end_date VARCHAR(50),
            layout_style VARCHAR(50) DEFAULT 'Auto Detect',
            display_delay VARCHAR(50) DEFAULT '3s',
            show_frequency VARCHAR(50) DEFAULT 'Once per Session',
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT '';`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS badge_tag VARCHAR(100) DEFAULT '';`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS banner_image TEXT;`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS highlights TEXT;`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS cta_text VARCHAR(150) DEFAULT 'Claim Offer on WhatsApp';`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS cta_action VARCHAR(50) DEFAULT 'whatsapp';`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50) DEFAULT '+91 73737 13559';`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS custom_url TEXT;`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS start_date VARCHAR(50);`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS end_date VARCHAR(50);`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS layout_style VARCHAR(50) DEFAULT 'Auto Detect';`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS display_delay VARCHAR(50) DEFAULT '3s';`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS show_frequency VARCHAR(50) DEFAULT 'Once per Session';`,
        `ALTER TABLE popups ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';`,

        // Users & Staff extra fields
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["ALL"]'::jsonb;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_plain VARCHAR(255) DEFAULT 'AdminPassword@2026';`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '+91 98424 01991';`,
        `UPDATE users SET password_plain = 'AdminPassword@2026' WHERE password_plain IS NULL;`,
        `UPDATE users SET phone = '+91 98424 01991' WHERE phone IS NULL;`,

        // Projects extra fields
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS plot_size_range VARCHAR(100);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS price_range VARCHAR(100);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS brochure_url TEXT;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_maps_embed_url TEXT;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_extent_acres DECIMAL(10, 2);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_plots_count INT DEFAULT 0;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS nearby_landmarks JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS dtcp_number VARCHAR(255);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS rera_number VARCHAR(255);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS available_plots_count INT DEFAULT 0;`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude VARCHAR(50);`,
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude VARCHAR(50);`,

        // Plots extra fields
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS dimension VARCHAR(100);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS dimension_str VARCHAR(100);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS length_ft DECIMAL(10, 2);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS width_ft DECIMAL(10, 2);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS total_price_lakhs DECIMAL(14, 2);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS price_per_sqft DECIMAL(10, 2);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS price DECIMAL(14, 2);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS listing_visibility VARCHAR(100) DEFAULT 'Publish to Website & CRM';`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS locality VARCHAR(255);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS road_corridor VARCHAR(255);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS taluk VARCHAR(100) DEFAULT 'Central';`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT 'City';`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS meta_description TEXT;`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS latitude VARCHAR(50);`,
        `ALTER TABLE plots ADD COLUMN IF NOT EXISTS longitude VARCHAR(50);`,

        // Media Library Table
        `CREATE TABLE IF NOT EXISTS media_library (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255),
            filename VARCHAR(255),
            url TEXT NOT NULL,
            type VARCHAR(20) NOT NULL DEFAULT 'image',
            size_bytes BIGINT DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE INDEX IF NOT EXISTS idx_media_library_filename ON media_library(filename);`,

        // High Performance Production Indexes
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
        `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
        `CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);`,
        `CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`,
        `CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);`,
        `CREATE INDEX IF NOT EXISTS idx_plots_project_id ON plots(project_id);`,
        `CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_project_id ON leads(project_id);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);`,
        `CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);`,
        `CREATE INDEX IF NOT EXISTS idx_site_visits_phone ON site_visits(customer_phone);`,
        `CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);`
      ];

      for (const q of alterQueries) {
        try {
          await client.query(q);
        } catch (alterErr: any) {
          // ignore already existing columns/indices
        }
      }
    }

    // AUTO-POPULATE / SEED PostgreSQL IF EMPTY
    try {
      const projCountRes = await client.query('SELECT count(*)::int as count FROM projects;');
      const projCount = projCountRes.rows[0]?.count || 0;

      if (projCount === 0) {
        console.log('→ Detected empty PostgreSQL database. Migrating initial dataset into PostgreSQL tables...');
        const store = ensureFallbackDB();

        // 1. Users
        if (store.users && store.users.length > 0) {
          for (const u of store.users) {
            try {
              await client.query(
                `INSERT INTO users (id, username, email, password_hash, password_plain, role, permissions, status, phone, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
                 ON CONFLICT (email) DO NOTHING;`,
                [
                  u.id, u.username, u.email, u.password_hash, u.password_plain || 'AdminPassword@2026',
                  u.role || 'super_admin', JSON.stringify(u.permissions || ['ALL']),
                  u.status || 'Active', u.phone || '+91 98424 01991',
                  u.created_at || new Date().toISOString(), u.updated_at || new Date().toISOString()
                ]
              );
            } catch (e: any) {
              console.warn('Sync user error:', e.message);
            }
          }
        }

        // 2. Amenities
        if (store.amenities && store.amenities.length > 0) {
          for (const a of store.amenities) {
            try {
              await client.query(
                `INSERT INTO amenities (id, name, icon_key, description)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id) DO NOTHING;`,
                [a.id, a.name, a.icon_key, a.description || '']
              );
            } catch (e: any) {
              console.warn('Sync amenity error:', e.message);
            }
          }
        }

        // 3. Projects
        if (store.projects && store.projects.length > 0) {
          for (const p of store.projects) {
            try {
              await client.query(
                `INSERT INTO projects (
                  id, name, slug, tagline, description, location_area, location_city,
                  total_extent_acres, total_plots_count, available_plots_count, plot_size_range,
                  price_range, status, is_featured, banner_image, video_url, brochure_url,
                  google_maps_embed_url, dtcp_number, rera_number, gallery_images, highlights,
                  amenities, nearby_landmarks, latitude, longitude, created_at, updated_at
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
                ) ON CONFLICT (slug) DO NOTHING;`,
                [
                  p.id, p.name, p.slug, p.tagline || '', p.description || '', p.location_area, p.location_city || 'Trichy',
                  p.total_extent_acres || 0, p.total_plots_count || 0, p.available_plots_count || 0, p.plot_size_range || '',
                  p.price_range || '', p.status || 'Ongoing', Boolean(p.is_featured), p.banner_image || '',
                  p.video_url || '', p.brochure_url || '', p.google_maps_embed_url || '', p.dtcp_number || '', p.rera_number || '',
                  JSON.stringify(p.gallery_images || []), JSON.stringify(p.highlights || []),
                  JSON.stringify(p.amenities || []), JSON.stringify(p.nearby_landmarks || []),
                  p.latitude || '', p.longitude || '',
                  p.created_at || new Date().toISOString(), p.updated_at || new Date().toISOString()
                ]
              );
            } catch (e: any) {
              console.warn('Sync project error:', e.message);
            }
          }
        }

        // 4. Plots
        if (store.plots && store.plots.length > 0) {
          for (const pl of store.plots) {
            try {
              await client.query(
                `INSERT INTO plots (
                  id, project_id, title, slug, type, category, locality, road_corridor, taluk, district,
                  plot_number, length_ft, width_ft, dimension_str, dimension, area_sqft, facing, approval_status,
                  price_per_sqft, total_price_lakhs, price, currency, status, listing_visibility,
                  amenities, description, meta_title, meta_description, video_url, latitude, longitude,
                  primary_image_url, gallery_images, video_urls, created_at, updated_at
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                  $11, $12, $13, $14, $15, $16, $17, $18,
                  $19, $20, $21, $22, $23, $24,
                  $25, $26, $27, $28, $29, $30, $31,
                  $32, $33, $34, $35, $36
                ) ON CONFLICT (id) DO NOTHING;`,
                [
                  pl.id, pl.project_id, pl.title || pl.plot_number, pl.slug || `property-${pl.id}`,
                  pl.type || 'Plot', pl.category || 'Sale', pl.locality || '', pl.road_corridor || '',
                  pl.taluk || '', pl.district || '', pl.plot_number || '',
                  pl.length_ft || 0, pl.width_ft || 0, pl.dimension_str || pl.dimension || '', pl.dimension || pl.dimension_str || '',
                  pl.area_sqft || 0, pl.facing || 'North', pl.approval_status || 'DTCP Approved',
                  pl.price_per_sqft || 0, pl.total_price_lakhs || 0, pl.price || 0, pl.currency || 'INR',
                  pl.status || 'Available', pl.listing_visibility || 'Publish to Website & CRM',
                  pl.amenities || '', pl.description || '', pl.meta_title || '', pl.meta_description || '',
                  pl.video_url || '', pl.latitude || '', pl.longitude || '',
                  pl.primary_image_url || '', JSON.stringify(pl.gallery_images || []), JSON.stringify(pl.video_urls || []),
                  pl.created_at || new Date().toISOString(), pl.updated_at || new Date().toISOString()
                ]
              );
            } catch (e: any) {
              console.warn('Sync plot error:', e.message);
            }
          }
        }

        // 5. Gallery
        if (store.gallery && store.gallery.length > 0) {
          for (const g of store.gallery) {
            try {
              await client.query(
                `INSERT INTO gallery (id, title, image_url, category, sort_order, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO NOTHING;`,
                [g.id, g.title, g.image_url, g.category || 'General', g.sort_order || 1, g.created_at || new Date().toISOString()]
              );
            } catch (e: any) {
              console.warn('Sync gallery error:', e.message);
            }
          }
        }

        // 6. Blogs
        if (store.blogs && store.blogs.length > 0) {
          for (const b of store.blogs) {
            try {
              await client.query(
                `INSERT INTO blogs (
                  id, title, slug, category, author, status, read_time, banner_image, excerpt, content, meta_title, meta_description, image_url, seo_title, seo_description, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                ON CONFLICT (slug) DO NOTHING;`,
                [
                  b.id, b.title, b.slug, b.category || 'Market Trends', b.author || 'Editorial',
                  b.status || 'Published', b.read_time || '5 min read', b.banner_image || b.image_url || '',
                  b.excerpt || '', b.content || '', b.seo_title || b.title, b.seo_description || b.excerpt || '',
                  b.image_url || b.banner_image || '', b.seo_title || b.title, b.seo_description || b.excerpt || '',
                  b.created_at || new Date().toISOString(), b.updated_at || new Date().toISOString()
                ]
              );
            } catch (e: any) {
              console.warn('Sync blog error:', e.message);
            }
          }
        }

        // 7. Settings
        if (store.settings && Object.keys(store.settings).length > 0) {
          for (const [key, val] of Object.entries(store.settings)) {
            try {
              const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
              await client.query(
                `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
                 ON CONFLICT (key) DO NOTHING;`,
                [key, strVal]
              );
            } catch (e: any) {
              console.warn('Sync settings error:', e.message);
            }
          }
        }

        console.log('✓ Initial dataset successfully populated into PostgreSQL!');
      }

      // Sync any user-created CRM Leads, Site Visits, or Popups from fallback storage into PostgreSQL
      const store = ensureFallbackDB();
      if (store.leads && store.leads.length > 0) {
        for (const l of store.leads) {
          try {
            await client.query(
              `INSERT INTO leads (id, project_id, name, phone, email, preferred_plot_size, message, source, status, stage, priority, admin_notes, notes, plot_id, plot_name, plot_description, budget, facing_preference, assigned_to, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
               ON CONFLICT (id) DO NOTHING;`,
              [
                l.id, l.project_id || null, l.name, l.phone, l.email || '', l.preferred_plot_size || '',
                l.message || '', l.source || 'Manual', l.status || 'New Lead', l.stage || 'New Lead',
                l.priority || 'Warm', l.admin_notes || '', JSON.stringify(l.notes || []),
                l.plot_id || '', l.plot_name || '', l.plot_description || '', l.budget || '',
                l.facing_preference || 'Any', l.assigned_to || 'Sales Team',
                l.created_at || new Date().toISOString(), l.updated_at || new Date().toISOString()
              ]
            );
          } catch {}
        }
      }

      if (store.site_visits && store.site_visits.length > 0) {
        for (const sv of store.site_visits) {
          try {
            await client.query(
              `INSERT INTO site_visits (id, lead_id, project_id, project_name, customer_name, customer_phone, customer_email, visit_date, visit_time, preferred_plot_size, pickup_needed, pickup_location, status, assigned_staff, notes, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
               ON CONFLICT (id) DO NOTHING;`,
              [
                sv.id, sv.lead_id || null, sv.project_id || null, sv.project_name || '',
                sv.customer_name, sv.customer_phone, sv.customer_email || '', sv.visit_date,
                sv.visit_time || '10:00 AM', sv.preferred_plot_size || '', Boolean(sv.pickup_needed),
                sv.pickup_location || '', sv.status || 'Requested', sv.assigned_staff || 'Sales Team',
                sv.notes || '', sv.created_at || new Date().toISOString(), sv.updated_at || new Date().toISOString()
              ]
            );
          } catch {}
        }
      }

      if (store.popups && store.popups.length > 0) {
        for (const pop of store.popups) {
          try {
            await client.query(
              `INSERT INTO popups (id, title, subtitle, category, badge_tag, banner_image, highlights, cta_text, cta_action, whatsapp_number, custom_url, start_date, end_date, layout_style, display_delay, show_frequency, status, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
               ON CONFLICT (id) DO NOTHING;`,
              [
                pop.id, pop.title, pop.subtitle || '', pop.category || '', pop.badge_tag || '',
                pop.banner_image || '', pop.highlights || '', pop.cta_text || '', pop.cta_action || 'whatsapp',
                pop.whatsapp_number || '+91 73737 13559', pop.custom_url || '', pop.start_date || null, pop.end_date || null,
                pop.layout_style || 'Auto Detect', pop.display_delay || '3s', pop.show_frequency || 'Once per Session',
                pop.status || 'Active', pop.created_at || new Date().toISOString(), pop.updated_at || new Date().toISOString()
              ]
            );
          } catch {}
        }
      }

      // Non-destructive: populate amenities for existing projects if empty in PostgreSQL
      try {
        const existingProjectsRes = await client.query('SELECT id, slug, amenities FROM projects;');
        for (const row of existingProjectsRes.rows) {
          const am = row.amenities;
          const isAmEmpty = !am || (Array.isArray(am) && am.length === 0) || am === '[]' || (typeof am === 'string' && am.trim() === '[]');
          if (isAmEmpty) {
            const defaults = DEFAULT_PROJECT_AMENITIES[row.id] || DEFAULT_PROJECT_AMENITIES[`proj-${row.slug}`];
            if (defaults && defaults.length > 0) {
              await client.query('UPDATE projects SET amenities = $1::jsonb WHERE id = $2;', [
                JSON.stringify(defaults),
                row.id
              ]);
              console.log(`✓ Backfilled default amenities for project in PostgreSQL: ${row.slug}`);
            }
          }
        }
      } catch (backfillErr: any) {
        console.warn('Backfill amenities error:', backfillErr.message);
      }

      // Record verified table counts
      const counts: Record<string, number> = {};
      for (const tbl of ['projects', 'plots', 'leads', 'site_visits', 'popups', 'blogs', 'gallery', 'users', 'settings']) {
        try {
          const cRes = await client.query(`SELECT count(*)::int as c FROM ${tbl};`);
          counts[tbl] = cRes.rows[0]?.c || 0;
        } catch {}
      }
      dbDiagnostics.tableCounts = counts;
      console.log('✓ PostgreSQL tables verified with live row counts:', counts);

      // Pre-load and synchronize in-memory cache directly from live PostgreSQL
      try {
        const memDb = ensureFallbackDB();
        const [projRows, plotRows, leadRows, blogRows, popRows, setRows] = await Promise.all([
          client.query('SELECT * FROM projects ORDER BY created_at DESC;').catch(() => ({ rows: [] })),
          client.query('SELECT * FROM plots ORDER BY created_at DESC;').catch(() => ({ rows: [] })),
          client.query('SELECT * FROM leads ORDER BY created_at DESC;').catch(() => ({ rows: [] })),
          client.query('SELECT * FROM blogs ORDER BY created_at DESC;').catch(() => ({ rows: [] })),
          client.query('SELECT * FROM popups ORDER BY created_at DESC;').catch(() => ({ rows: [] })),
          client.query('SELECT * FROM settings;').catch(() => ({ rows: [] })),
        ]);

        if (projRows.rows.length > 0) memDb.projects = projRows.rows;
        if (plotRows.rows.length > 0) memDb.plots = plotRows.rows;
        if (leadRows.rows.length > 0) memDb.leads = leadRows.rows;
        if (blogRows.rows.length > 0) memDb.blogs = blogRows.rows;
        if (popRows.rows.length > 0) memDb.popups = popRows.rows;
        if (setRows.rows.length > 0) {
          const settingsObj: Record<string, any> = {};
          setRows.rows.forEach((r: any) => {
            try {
              settingsObj[r.key] = typeof r.value === 'string' && (r.value.startsWith('{') || r.value.startsWith('['))
                ? JSON.parse(r.value)
                : r.value;
            } catch {
              settingsObj[r.key] = r.value;
            }
          });
          memDb.settings = { ...memDb.settings, ...settingsObj };
        }
        memoryFallbackDB = memDb;
        console.log('✓ In-memory cache synchronized with live PostgreSQL rows.');
      } catch (syncErr: any) {
        console.warn('Sync memory cache note:', syncErr.message);
      }

    } catch (popErr: any) {
      console.warn('Note on table population:', popErr.message);
    }

    client.release();
  } catch (err: any) {
    console.warn('! PostgreSQL connection not reachable (' + err.message + ')');
    console.log('→ Operating with resilient file-backed persistent database at data/local_db.json');
    isPostgresAvailable = false;
    dbDiagnostics.isPostgres = false;
    dbDiagnostics.connectionError = err.message;
    dbDiagnostics.connectionAttempts = attemptLogs;
    dbDiagnostics.activeConfig = {
      host: baseHost || (connectionString ? 'via DATABASE_URL' : '127.0.0.1'),
      port: basePort || 5432,
      user: baseUser,
      database: baseDatabase
    };
    ensureFallbackDB();
  }
}

export const db = {
  isPostgres: () => isPostgresAvailable,
  getFallbackData: () => ensureFallbackDB(),
  saveFallbackData: (data: FallbackDB) => saveFallbackDB(data),
  getDiagnostics: () => ({ ...dbDiagnostics }),

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

      if (upper.includes('FROM MEDIA_LIBRARY')) {
        let rows = [...(store.media_library || [])];
        if (params.length > 0 && upper.includes('WHERE ID = $1')) {
          rows = rows.filter(m => m.id === params[0]);
        } else if (params.length > 0 && (upper.includes('WHERE FILENAME = $1') || upper.includes('WHERE URL = $1'))) {
          rows = rows.filter(m => m.fileName === params[0] || m.filename === params[0] || m.url === params[0]);
        }
        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows, rowCount: rows.length };
      }
    }

    return { rows: [], rowCount: 0 };
  }
};
