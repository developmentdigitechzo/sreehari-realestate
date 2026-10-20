# Backend & Database — Agent Instructions (`backend/`)

This directory contains the Express.js / TypeScript backend service and PostgreSQL database access layers for **Sree Hari Realty Promoters**.

All backend tasks must comply with the mandatory root workflow in `c:/sreehari-realestate/AGENTS.md` and the rules below.

---

## 1. Architecture & Service Conventions

- **Runtime & Framework**: Node.js with Express.js and TypeScript (`backend/src/server.ts`).
- **Database Driver**: `pg` (PostgreSQL client pool) configured in `backend/src/config/db.ts`.
- **Database Schema**: Full DDL is maintained in `backend/src/models/schema.sql`.
- **Directory Structure**:
  - `src/controllers/`: Business logic and database query operations.
  - `src/routes/`: Express router definitions.
  - `src/middleware/`: Authentication (JWT), request validation, and error handling.
  - `src/models/`: SQL schema definitions and TypeScript interfaces.
  - `src/config/`: Database pool initialization and environment configuration.
  - `data/local_db.json`: Offline fallback data store (used only when PostgreSQL is unreachable in local dev).

---

## 2. PostgreSQL Schema & Database Safety Protocols

### Mandatory Safety Rules:
1. **Never Drop or Truncate Production Tables**:
   - Dropping, truncating, or wiping tables as a shortcut to fix schema mismatch or test data is **STRICTLY FORBIDDEN**.
   - Always preserve existing records, primary keys, and foreign key relations.
2. **Never Overwrite Real Records with Seed/Dummy Data**:
   - Customer inquiries, leads, booked plots, and admin user records must never be overwritten by seed scripts.
3. **Inspect Schema First**:
   - Prior to writing or modifying any SQL queries or controller methods, inspect `backend/src/models/schema.sql` and the active database schema to ensure column names and types match.
4. **Approval for Schema Changes**:
   - Explain proposed schema additions or migrations in detail.
   - **Wait for explicit user approval before executing any schema-modifying SQL.**
5. **Incremental / Safe Migrations**:
   - Use additive, backward-compatible SQL: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`.
   - Never remove or rename existing columns without an approved migration path and data safety plan.
6. **Separate Code and Database Operations**:
   - Treat backend code deployments and database migrations as distinct actions. Migrations must be verified separately with a database backup in place.

---

## 3. Database Connection & Environment Compatibility

- **Connection Configuration**:
  - Support discrete variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) and connection string (`DATABASE_URL`).
- **cPanel Linux Environment Requirement**:
  - In cPanel Linux hosting, PostgreSQL local connections must use `DB_HOST=127.0.0.1` rather than `localhost`. Using `localhost` causes Node.js `pg` to attempt connecting via a UNIX socket, which often fails in cPanel.
- **Dual-Store Synchronization**:
  - When PostgreSQL is active, all writes (create, update, delete) must target PostgreSQL.
  - If the JSON fallback store (`backend/data/local_db.json`) is maintained for offline development, ensure consistency so switching between local and live does not cause data desynchronization.

---

## 4. API & Security Standards

- **Standardized Response Format**:
  - Success: `{ "success": true, "data": <payload>, "message": "Optional message" }`
  - Error: `{ "success": false, "error": "Clear description of error" }`
- **SQL Injection Prevention**:
  - Never concatenate user input directly into SQL strings. Always use parameterized queries (`$1, $2, ...`).
- **Authentication & Permissions**:
  - Protected endpoints must enforce JWT token verification via auth middleware.
  - Admin passwords must be securely hashed using `bcrypt` (never stored as plain text in new production accounts).
- **Audit Logging**:
  - High-impact operations (deleting records, updating settings, modifying staff roles) should record an entry in the `audit_logs` table.

---

## 5. Verification Checklist for Backend Changes

Before reporting completion on any backend task, verify:
- [ ] Schema changes were reviewed, approved, and executed safely using incremental SQL.
- [ ] No real data was deleted, overwritten, or truncated.
- [ ] Parameterized queries are used for all database interactions.
- [ ] TypeScript compiles cleanly without errors (`npm run build` or `tsc --noEmit`).
- [ ] API endpoints respond with proper HTTP status codes and standardized JSON envelopes.
- [ ] Database connection functions correctly with both local and production environment formats.
