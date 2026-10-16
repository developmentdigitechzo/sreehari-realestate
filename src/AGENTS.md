# Frontend & Admin CRM — Agent Instructions (`src/`)

This directory contains the Next.js 16 frontend application for **Sree Hari Realty Promoters**. It includes both the customer-facing public portal and the internal Admin CRM platform.

All frontend tasks must comply with the mandatory root workflow in `c:/sreehari-realestate/AGENTS.md` and the rules below.

---

## 1. Architecture & Component Conventions

- **Framework**: Next.js 16 with App Router (`src/app/`).
- **Styling**: Tailwind CSS v4 with custom CSS variables (`src/app/globals.css`).
- **Icons**: `lucide-react`.
- **API Client**: Centralized in `src/lib/api.ts`. All network calls must flow through this helper or use standard fetch against `NEXT_PUBLIC_API_URL`.
- **State & Theme Management**: `src/lib/theme.ts` manages CRM color accents and light/dark theme modes.
- **Client Components**: Any component utilizing React hooks (`useState`, `useEffect`, `useRouter`, `usePathname`) must explicitly declare `'use client';` at the top of the file.

---

## 2. Public Portal vs. Admin CRM Isolation

### Public Website (`src/app/(public)` & root routes `/`, `/about`, `/contact`, `/properties`, etc.):
- **Preserve Existing Public Design**: The public portal features a distinct, luxury dark real estate branding.
- **Strict Isolation**: Modifying CRM styles, components, or theme tokens must **NEVER** bleed into or alter the public website layout, typography, or styling.
- Any style adjustments to the public site require explicit user approval.

### Admin CRM (`src/app/admin/*`):
- All admin styling, background colors, and theme overrides must be scoped specifically to `[data-admin-theme-mode="light"]` and `[data-admin-theme-mode="dark"]`, or within the admin layout container.
- Theme switching is controlled via `src/lib/theme.ts` and `src/app/admin/layout.tsx`.

---

## 3. CRM Light & Dark Theme Contrast Standards

Every CRM module (Dashboard, Projects, Plots, Leads, Site Visits, Staff, Settings, Gallery, Blogs, Popups) and shared component must support both **Light** and **Dark** modes seamlessly:

1. **Light Theme Contrast**:
   - Backgrounds: Clean whites (`#ffffff`, `bg-white`) and subtle slates (`bg-slate-50`, `bg-slate-100/50`).
   - Text: Dark slate (`text-slate-800`, `text-slate-900`) for headers, body text, and table values. Secondary text must use readable muted slate (`text-slate-500`, `text-slate-600`).
   - **Never allow white, light gray, or low-contrast text on light backgrounds.**
2. **Dark Theme Contrast**:
   - Backgrounds: Deep slate / navy (`bg-slate-900`, `bg-slate-950`).
   - Text: Bright slate / white (`text-slate-100`, `text-slate-200`).
3. **Action Buttons**:
   - Primary action buttons (brand emerald/golden/blue) must feature high-contrast text and icon colors in **both** light and dark modes (pure white `#ffffff` or dark `#0f172a` depending on luminance).
   - Secondary / Ghost buttons must have clear borders (`border-slate-300` in light, `border-slate-700` in dark) and distinct hover states.
4. **Shared Components & Modals**:
   - Modals, popovers, dropdown menus, table headers, form input fields, and search boxes must adapt their borders, backgrounds, and text colors properly according to the active theme.

---

## 4. Data Integration & Database Integrity

- **Database-Backed Data Only**:
  - All real estate data (plots, projects, inquiries, leads, site visit bookings, staff accounts) must be fetched from the backend API.
  - **NEVER insert fake, hardcoded, or mock business records** as fallback data if an API call fails or returns empty.
- **Graceful Loading & Empty States**:
  - If a table or module has zero records in the database, display a user-friendly empty state (e.g., "No leads found. Create your first lead.") rather than fabricated placeholder data.
  - Provide proper loading indicators/skeletons while data is in flight.
  - If the backend is disconnected, display a clear, non-intrusive alert indicating connection status.

---

## 5. Verification Checklist for Frontend Changes

Before reporting completion on any frontend task, verify:
- [ ] Both CRM Light Mode and CRM Dark Mode were inspected and tested.
- [ ] No light-on-light or dark-on-dark unreadable text regressions.
- [ ] Action buttons display distinct, readable labels and icons in both modes.
- [ ] The public website layout and styling remain completely unaffected.
- [ ] Responsive behavior (desktop, tablet, mobile) functions properly.
- [ ] Modals open, submit data correctly, and close without console errors.
- [ ] Next.js build passes cleanly (`npm run build` or development compilation without runtime errors).
