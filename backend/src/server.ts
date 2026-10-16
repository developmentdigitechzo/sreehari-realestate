import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase, db } from './config/db';
import publicRoutes from './routes/public.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables from cwd, backend/, or root directory
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'https://giving-amethyst-anteater.172-235-18-108.cpanel.site',
  'http://giving-amethyst-anteater.172-235-18-108.cpanel.site',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  ...envOrigins
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      defaultAllowedOrigins.includes(origin) ||
      origin.includes('giving-amethyst-anteater.172-235-18-108.cpanel.site') ||
      origin.includes('cpanel.site') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    // Allow all other origins in production to prevent blocking custom domains
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check & DB Diagnostics
app.get('/api/health', (req, res) => {
  const diag = db.getDiagnostics();
  res.json({
    status: diag.isPostgres ? 'healthy' : 'degraded_fallback',
    service: 'Sree Hari Realty Promoters API',
    database: {
      connected: diag.isPostgres,
      storage_type: diag.isPostgres ? 'PostgreSQL Production Database' : 'Local JSON Persistent Storage (data/local_db.json)',
      host: diag.activeConfig?.host || '127.0.0.1',
      database_name: diag.activeConfig?.database || 'configured',
      error: diag.connectionError,
      connected_at: diag.connectedAt,
      table_rows: diag.tableCounts
    },
    business_focus: 'Land & Plots Gated Communities',
    timestamp: new Date().toISOString()
  });
});

// Route registration
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler
app.use(errorHandler);

// Bootstrap
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 SREE HARI REALTY PROMOTERS API is running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Public API:   http://localhost:${PORT}/api/public/projects`);
    console.log(`   Admin API:    http://localhost:${PORT}/api/admin/dashboard/stats`);
    console.log(`=======================================================`);
  });
}

startServer();

export default app;
