# Production code review — 23 October 2026

## Scope and confidence

Reviewed public React source, admin source, shared utilities, API routes and validation, scripts, package manifests, static assets, environment examples, HTML entry points and Vercel configuration. A static relative-import graph was traced from all three application entry points. This does not prove CSS selectors or dynamically referenced assets unused. No live content, email campaigns, cloud files, database settings or credentials were changed. No production build or automated test suite was run during this review; ESLint passed after the targeted source cleanup.

## Fix before deployment

### P1 — Credentials in a tracked environment example

`backend/.env.example` contained credential-like settings, including a Cloudinary API secret. Sensitive/example identity values were replaced with blanks or explicit placeholders. Existing ignored local `.env` files were preserved.

**Required owner action:** rotate exposed service credentials, and replace any real admin password/TOTP seed that appeared in that file. Review repository history and hosting secrets. Removing a value from the current file does not revoke it or remove prior copies. Never put replacement secrets in chat or any `VITE_*` variable.

### P1 — Production API routing is not configured in this repository

Both browser apps default to `/api` in production, but `vercel.json` and `admin/vercel.json` contain no API proxy/rewrite. The Express backend is a separate Node service. Their CSPs permit only same-origin `connect-src`. Deploying just the static builds will therefore leave API calls pointing at nonexistent routes; setting a cross-origin `VITE_API_URL` alone will be blocked by CSP.

Choose the actual hosting topology before release: configure a same-origin `/api` proxy for each frontend, or explicitly allow the API's exact HTTPS origin in each CSP. Admin/API cookies require the same schemeful site or a same-origin proxy under the current production cookie rules. Confirm exact public/admin origins and trusted proxy hops. README previously mentions replacing an API placeholder, but the CSP currently has no such placeholder; update deployment instructions with real host values.

### P2 — Admin cover previews blocked by production CSP (fixed)

`admin/vercel.json` now permits `https://res.cloudinary.com` in `img-src`. Previously the new cover preview worked in development but Cloudinary images were blocked in the deployed admin. The optional direct image URL field can still point to another host; those previews remain blocked unless that specific trusted host is explicitly allowed. Prefer Cloudinary uploads, or constrain the URL field to approved image hosts.

## Cleanup applied

| Item | Change |
| --- | --- |
| `public/placeholder-logo.png` | Deleted: no static reference in application source or HTML; profile schemas accept only HTTPS media URLs. |
| `shared/browser-config.js` | Added one public API base configuration shared by public profile, contact, notes and admin clients. |
| `src/App.jsx` | Removed the browser console diagnostic; retained the intended bundled-content fallback. |
| `src/notes-api.js`, `admin/src/api.js`, contact section | Removed repeated API URL declarations. Authenticated and public request handling remain separate. |
| `admin/.env.example` | Corrected outdated admin port comment to 4176. |
| `backend/.env.example` | Removed credential-like example values; no private env files modified. |

## Dead code and deletion candidates

- **No whole unused component, page, custom hook or source module found** by the entry-point import graph. A module being reachable does not prove every export or conditional branch is used.
- `tailwind.config.js` appears inactive: the project uses Tailwind's v4 PostCSS plugin and CSS import, with no `@config` reference. It contains only default content/theme/plugins settings. Candidate for deletion after confirming no external tool consumes it. Keep `postcss.config.js`, which is active.
- The following `backend/scripts/*.py` files are historical source-rewrite tools, not app runtime or package commands: `add-resource-posts.py`, `align-notes-fields.py`, `connect-buttondown.py`, `extend-notes-ui.py`, `extend-notes.py`, `fix-subscription.py`, `refine-notes-navigation.py`, `refine-notes.py`, `review-admin.py`. Archive or delete after preserving any needed implementation history. Do not rerun them on the current source: they perform broad string replacements against older layouts.
- `review-sap.py` and `render-covers.py` are document-import utilities, not dead application code. Retain if reimporting the SAP collection; document Python dependencies and replace the hardcoded `E:/sap hybris` path with an argument.
- `check-buttondown.js`, `diagnose-buttondown.js`, `check-notes.js` and `verify-note-assets.js` are manual operational diagnostics. Keep in a clearly documented maintenance folder if useful; avoid shipping them in the API runtime artifact.
- `migrate-media.js` references original local files already removed after Cloudinary migration. Preserve as historical migration tooling or make its inputs configurable; it cannot reliably re-create a fresh installation from this repository alone.
- `backend/migrations/` has local extraction, cover and QA outputs. Do not blindly delete it: upload ledgers can prevent duplicate migrations. Exclude private source extracts and QA artifacts from deployment packages; the reviewed directory has no tracked files.
- Keep `backend/test/`: these are actual regression tests, not temporary debugging code. Keep explanatory comments; no disabled executable blocks were identified in application source.

## Refactoring priorities

1. **Format long files first.** `admin/src/NotesAdmin.jsx` has an approximately 9,800-character JSX line; `admin/src/style.css` has a line over 13,000 characters. `src/Notes.jsx` and `admin/src/main.jsx` also compress entire workflows onto single lines. Add a consistent formatter and format in an isolated change before changing behavior.
2. **Split notebook responsibilities.** Extract note list/filters, editor fields, attachments, newsletter actions, card, dates, resource link, subscription form and navigation into focused components. `NoteCover` and `NoteContribution` already establish this direction. Preserve dirty-state guards, optimistic version checks and partial-success messages.
3. **Move effects out of App.** Extract scroll progress, reveal observers and portrait pointer effects into focused hooks with cleanup. Move the portfolio's `NotesSection` teaser out of `Notes.jsx`; importing the teaser currently pulls notebook/contribution code and CSS into the portfolio dependency graph.
4. **Share domain constants.** Category lists, resource type labels, file size limits and browser file-signature checks are repeated in contribution/admin/API code. Share pure constants and browser validation helpers. Keep server validation authoritative; do not import Node-only utilities into browser bundles.
5. **Use admin-managed data consistently.** Hero and footer still hardcode the owner name/location, education details and current-project captions despite the editable profile fields. Read applicable values from the profile, or document intentional editorial copy that cannot be changed in admin. Avoid changing the fallback snapshot into an empty object: it intentionally supports API outages.
6. **Consolidate styles carefully.** Public and admin styles contain layered overrides from earlier reviews. Group each component's base, theme and breakpoint rules together. Duplicate selectors alone are not safe evidence for deletion because their cascade order affects layout and contrast.
7. **Unify failure handling selectively.** `notesRequest` overwrites any caller-provided abort signal with its own timeout; combine signals as the admin request helper does. Keep cookie/CSRF behavior exclusive to the admin client. Add an error boundary so an unexpected rendering error does not blank the entire app.

## Hygiene, dependencies and types

- ESLint passed. No `console.log` or `debugger` remains in the reviewed browser source. Server error/startup logs and CLI migration/MFA output serve operational purposes; remove diagnostic scripts if unwanted, rather than deleting all production logging. MFA generation intentionally displays a new secret locally.
- `package.json` lists `autoprefixer` in both dependencies and devDependencies. Keep one devDependency and update the lockfile using the package manager. Build tooling (`tailwindcss`, `@tailwindcss/postcss`, `postcss`) can also be grouped as devDependencies if the host installs build dependencies before building.
- `eslint.config.js` ignores unused uppercase variables and has no JSX-aware unused-component rule. A green lint result alone cannot prove every imported component is used. Narrow the exemption or use JSX-aware linting before enforcing it.
- This is JavaScript, with no TypeScript interfaces or runtime prop-types system. Add JSDoc models or incrementally adopt TypeScript for profile, note, attachment, session and API result shapes. Preserve Zod server schemas; compile-time types do not replace validation.
- `backend/package.json`'s syntax command checks only three files. Expand it to all maintained API modules/scripts. Keep lint, tests, dependency audit and build as separate CI stages so skipped checks are visible.
- Backend `BUTTONDOWN_USERNAME` is not read by runtime source. Only `VITE_BUTTONDOWN_USERNAME` drives the browser signup destination. Remove the unused backend setting/docs entry or make its purpose explicit. Resend routes remain a supported fallback and are not dead code just because Buttondown is selected today.

## Performance and build readiness

- **Lazy routes:** split `/notes` and portfolio with `React.lazy`/Suspense after moving the shared teaser to its own module. Current `src/main.jsx` statically imports both apps. Consider lazy loading below-fold sections only after measuring actual bundle cost.
- **List payloads:** public notes return full bodies for up to 100 entries, including up to 30,000 characters each, though listing cards need only metadata. Add paginated metadata endpoints and a single-note reader endpoint. Admin's latest 200 entries and contacts' latest 100 also need pagination rather than misleading all-time counts.
- **Images:** retain existing lazy loading for below-fold images and high priority for the hero portrait. Add Cloudinary sized delivery variants with automatic format/quality, `srcSet`/`sizes`, and stable width/height or aspect ratios. Project uploads currently render the original image without responsive variants; cover cards reserve a stable height already.
- **Dates/filtering:** hoist reusable `Intl.DateTimeFormat` instances and memoize derived filters if profiling shows list cost. Do not add memoization everywhere without evidence.
- **Fonts/SEO:** entry HTML has language, viewport, description and favicon; admin has noindex. Add page-specific notes/post descriptions, canonical URLs and social metadata. Consider prerendering or server rendering if search/share previews of individual notes are important; client-side title updates do not provide full HTML metadata to all crawlers.
- **Routing:** only exact `/notes` renders the notebook in `src/main.jsx`, with an exact matching Vercel rewrite. Normalize `/notes/` and give unknown URLs an intentional not-found page.
- **Secrets:** only API URL/public site URL/newsletter username are read through browser build variables. Private `.env` files are ignored and only examples are tracked. Environment values must be set separately for frontend builds, admin builds and API runtime. Static `VITE_*` changes require a rebuild.

## Accessibility and semantics

Public pages and admin use main/nav/header/section/footer landmarks; public pages have skip links, forms have visible labels and error/status roles, note dates use `<time>`, and public attachments have names. Preserve those in refactoring. Portfolio navigation uses buttons for section jumps; real anchor links would give better browser navigation and progressive enhancement. Confirm heading hierarchy after splitting components. Keyboard/screen-reader behavior and composed light/dark contrast need a browser review; a static semantic scan is not a conformance claim.

## Remaining security/operational gaps

- PDF/image signatures restrict file formats but do not scan malware or sanitize documents. Published visitor files need a documented review/scanning policy.
- Pending uploads remove their expiry when claimed. Published original blobs can remain in MongoDB after copying to Cloudinary; implement retention/cleanup only after preserving retry/review requirements and checking shared asset ownership. Add storage monitoring and abuse controls beyond per-IP limits.
- Newsletter sending and EmailJS pacing occur within request/process lifetimes. Durable jobs and delivery receipts are needed for scale and reliable restarts; provider acceptance is not inbox delivery.
- Contact quota is a rolling 24 hours, not a calendar-day reset. Current help copy says daily; document this distinction or change the implementation only if calendar-day behavior is desired.

## Recommended release order

1. Rotate exposed credentials and configure the real HTTPS/API proxy topology.
2. Review this cleanup diff, format source, and archive confirmed historical tools.
3. Add type/lint/CI improvements, then split routes and large modules in reviewable changes.
4. Run API tests and dependency audits, then both production builds with the actual production build variables.
5. Smoke-test the deployed build: login/TOTP/CSRF, note moderation and cover/PDF rendering, contact quotas, subscription consent/unsubscribe and explicit newsletter notifications. Use controlled recipients and avoid real subscriber campaigns for testing.

This report is a code review, not a penetration test or an assurance that no vulnerability remains.
