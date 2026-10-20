<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sree Hari Realty — Permanent Project & Agent Instructions

This repository houses the full-stack web platform for **Sree Hari Realty Promoters** (Trichy, Tamil Nadu). It consists of a Next.js 16 frontend and an Express.js / PostgreSQL backend powering both the public real estate portal and the internal Admin CRM.

All AI agents, coding assistants, and developers operating in this repository MUST strictly abide by the rules and workflows outlined in this document.

---

## 1. Mandatory Root-Cause-First Workflow

Every task—whether bug fix, feature request, refactor, database modification, or deployment—MUST follow this strict sequence without exception:

```
[1. Investigate] 
       ↓
[2. Establish Root Cause] 
       ↓
[3. Inspect Dependencies & Schema] 
       ↓
[4. Prepare Implementation Plan] 
       ↓
[5. STOP & WAIT FOR EXPLICIT USER APPROVAL] 
       ↓
[6. Implement ONLY the Approved Plan] 
       ↓
[7. Test & Verify Actual Behavior] 
       ↓
[8. Report Exact Changes & Honest Results]
```

### Detailed Steps:
1. **Read Applicable Instructions**: Inspect this root `AGENTS.md` and any domain-specific instruction files (`src/AGENTS.md` for frontend, `backend/AGENTS.md` for backend & database).
2. **Investigate the Problem**: Read relevant files, logs, error traces, and configuration before taking any action. Safe, read-only diagnostics are permitted.
3. **Establish the Root Cause**: Identify why the issue occurs. If the root cause is uncertain or requires further information, state what remains unknown honestly. Do NOT guess.
4. **Inspect Dependencies**: Verify related APIs, UI components, database relationships, foreign keys, environment variables, and deployment implications.
5. **Prepare an Implementation Plan**: Provide a concise plan covering:
   - Affected files and components.
   - Proposed changes and rationale.
   - Potential risks or breaking changes.
   - Testing and verification steps.
   - Deployment impact (local vs. live production).
6. **STOP & WAIT FOR EXPLICIT USER APPROVAL**:
   - **Do NOT modify application code, execute database mutations/migrations, or change production configuration until the user explicitly approves the plan.**
   - If investigation reveals a need to alter the approved scope, STOP immediately and request approval for the revised plan.
7. **Implement Only the Approved Plan**: Do not make extraneous, unrelated, or cosmetic changes outside the agreed scope. Maintain all existing comments, docstrings, and architectural patterns.
8. **Run Relevant Tests & Verify Actual Behavior**: Verify the fix or feature by executing builds, linting, tests, or runtime verification.
9. **Report Transparently**: State exactly which files were modified and present verified findings. **Never claim unverified success.**

---

## 2. Core Development & Data Integrity Principles

- **No Hardcoded Business Records / Fake Fallbacks**:
  - Never fabricate mock properties, leads, bookings, users, or analytics records in place of database queries.
  - When backend data or database tables are empty or unreachable, show proper empty states, loading skeletons, or actionable error messages.
- **Data Preservation**:
  - Real customer inquiries, site visits, leads, and property records must NEVER be overwritten, truncated, or replaced with seed/dummy data.
- **Documentation & Code Integrity**:
  - Preserve existing code comments, docstrings, and formatting unless explicitly instructed to update them.
- **Environment & Secrets Security**:
  - NEVER commit `.env`, `.env.local`, `.env.production`, or any credentials/passwords to git.
  - Production database credentials must remain strictly confidential in the server environment.

---

## 3. Environments & Deployment Guidelines

### Local Development Environment:
- **Frontend**: Next.js 16 (`http://localhost:3000`)
- **Backend API**: Express + TypeScript (`http://localhost:5000`)
- **Database**: Local PostgreSQL instance (`localhost:5432`) or local fallback store.
- **Environment Configuration**: Set in `.env` / `backend/.env`.

### Live Production Environment (cPanel):
- **Domain**: `https://giving-amethyst-anteater.172-235-18-108.cpanel.site`
- **Architecture**: cPanel Node.js Application Manager running Next.js standalone and Express backend.
- **Database**: Remote PostgreSQL database (`sreeharirealty_db`) managed via cPanel / pgAdmin.
- **Connection Rule**: In cPanel Linux hosting, use `127.0.0.1` rather than `localhost` to avoid unix socket ambiguity.

### Deployment Safety Rules:
1. **NEVER Push to Git (`git push`) Without Explicit Instruction**:
   - Committing locally for safekeeping is permitted when instructed, but **NEVER run `git push` to remote repositories** unless the user explicitly directs you to push.
2. **NEVER Create Deployment Zips Without Explicit Request**:
   - **NEVER create deployment `.zip` files** or bundle code for cPanel upload unless the user explicitly tells you to generate a zip file.
3. **Never Assume Automatic Sync**: Changes made in local development NEVER automatically reach production.
4. **Explicit Approval Required**: Never run production migration scripts or alter cPanel configurations without explicit user instruction and approval.
5. **Database Migration Separation**: Code deployment and database schema updates must be treated as separate, deliberate operations. Always backup production data prior to applying migrations.
6. **Live Verification**: When given access or after deployment, verify actual live HTTP status, API responses, and database connectivity.

---

## 4. Directory-Specific Instruction Structure

- **Frontend & Admin CRM**: Refer to `src/AGENTS.md` for Next.js App Router rules, theme contrast standards (Light & Dark), and UI isolation.
- **Backend & Database**: Refer to `backend/AGENTS.md` for Express API endpoints, PostgreSQL schema rules (`models/schema.sql`), migration safety, and dual-store sync.
