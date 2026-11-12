# Portfolio Motion Implementation Plan

**Goal:** Refine the portfolio and feature the updated Raaga and InsightCode projects.

**Architecture:** Keep existing sections and API contracts; share a versioned project refresh between the frontend fallback and a one-time backend migration. Use Framer Motion only where it replaces existing animation ownership.

**Tech Stack:** React 19, Vite, Framer Motion, Express, MongoDB.

**Spec:** ../specs/2026-11-12-portfolio-motion-design.md

## Constraints and review focus

- Preserve unrelated profile data, project images and extra projects.
- Do not overwrite admin changes once the catalog version is current.
- Mobile menu focus/Escape and 320px layouts must keep working.
- Reduced motion must immediately expose content and disable transforms.
- Existing notebook, contact and admin workflows stay intact.

## Tasks

- [x] Add shared project catalog and migration tests. Verify legacy refresh, idempotence, current admin removals, image retention and optimistic version conflicts.
- [x] Refresh hero, project previews and layout; add Framer Motion navigation, toolkit transitions and reveals. Verify lint/build and browser behavior.
- [x] Review the complete diff, run relevant checks, and commit to a review branch with verification notes.

## Verification

Frontend lint and production build pass. All 56 backend tests and seven browser tests pass. Browser checks cover legacy/current API payloads, 320/390/768/1440px widths, mobile focus and Escape, light/dark themes, toolkit selection and reduced motion. Independent review found no important issues. Production MongoDB migration and external services were not exercised; deployment runs the migration once.
