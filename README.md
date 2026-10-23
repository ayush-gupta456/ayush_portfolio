# Ayush Gupta portfolio

Three deployable apps share one repository:

| App | Folder | Purpose |
| --- | --- | --- |
| Public portfolio | repository root | Public site and contact form |
| Admin portal | `admin/` | Private portfolio editor and contact inbox |
| API | `backend/` | Authentication, validation, MongoDB persistence, and public content API |

## Run all three apps locally

The public site runs at [http://localhost:5174](http://localhost:5174), admin at [http://localhost:4176](http://localhost:4176), and API at `http://localhost:8787`. I set the public site to 5174 and admin to 4176 because other processes already occupy the usual ports. This setup uses MongoDB or Atlas and does not require Docker.

1. Install Node.js 22 LTS and MongoDB Community Server. In the installer, enable **Install MongoD as a Service**. MongoDB's [Windows install guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/) covers the service option; the service can be started with `net start MongoDB` from an Administrator terminal.
2. In PowerShell from the repository root, create ignored local env files from the safe examples:

   ```powershell
   Copy-Item .env.example .env
   Copy-Item admin/.env.example admin/.env
   Copy-Item backend/.env.example backend/.env
   ```

3. Edit `backend/.env`. For local MongoDB, keep `MONGODB_URI=mongodb://127.0.0.1:27017/ayush_portfolio`. Set your admin email and a unique `ADMIN_PASSWORD` with at least 14 characters. Generate a TOTP seed using `npm run mfa:setup --prefix backend`, enroll the displayed provisioning URI in an authenticator app, and paste the seed into `ADMIN_TOTP_SECRET`. The public/admin origins should remain `http://localhost:5174` and `http://localhost:4176`.
4. Keep the root and admin `VITE_API_URL` values pointed at `http://localhost:8787/api`; admin `VITE_PUBLIC_URL` should be `http://localhost:5174`.
5. Install dependencies from the repository root, then in `admin/` and `backend/`:

   ```powershell
   npm install
   Push-Location admin; npm install; Pop-Location
   Push-Location backend; npm install; Pop-Location
   ```

6. Confirm MongoDB is running, then create the collections, indexes, and starter portfolio record:

   ```powershell
   Get-Service MongoDB
   npm run init-db --prefix backend
   ```

7. Open three PowerShell terminals at the repository root and run one command in each:

   ```powershell
   npm run dev --prefix backend
   npm run dev
   npm run dev --prefix admin
   ```

8. Open the public site at `http://localhost:5174` and admin at `http://localhost:4176`. Sign into admin using the email/password from `backend/.env` and the current six-digit code from your authenticator app.

If MongoDB is installed but stopped, start it from an Administrator PowerShell with `Start-Service MongoDB`. If you choose Atlas instead, get a **driver connection string** from Atlas's Connect flow, allow your machine's IP, and use the `mongodb+srv://...` URI as `MONGODB_URI`; the Atlas web dashboard URL is not a database connection string. Keep `.env` files private and out of Git.

## Admin and security

The admin has a profile editor and contact inbox, with no public registration route. API input is validated against strict schemas; external links must use HTTPS and submitted content is rendered as text. Security controls include Argon2id password verification, TOTP with one-time-step replay prevention, hashed random session identifiers, HttpOnly/Secure/SameSite cookies, exact origin checks, CSRF tokens, persistent rate limits, security headers, JSON size limits, a contact honeypot, and hashed-IP audit events.

MongoDB stores the profile, sessions, one-time MFA steps, contact messages, audit events, and rate-limit records. The initializer creates TTL and query indexes and seeds the initial profile. For production, initialize with a temporary database-admin credential, then run the API using a dedicated least-privilege account scoped to this database. Use TLS, network access lists, protected secret storage, encrypted backups, monitoring, and a tested restore process. TTL cleanup is asynchronous, so the API also checks session expiry on every request.

Contact submissions are delivered through the EmailJS main and auto-reply templates. The API validates email syntax and checks for mail-routing DNS records; this confirms the domain can receive mail, not that a specific mailbox exists. MongoDB stores only the sender's name and email (plus its generated record ID); the subject and message are used for email delivery and discarded by the API after sending. Each normalized email address can submit at most two messages in a rolling 24-hour period, with an additional limit of four submissions per IP per hour. When the daily limit is reached, the form directs the sender to email Ayush after 6:00 PM IST. Put the EmailJS service ID, public key, and private key in `backend/.env`; the private key must stay server-side. The template IDs are already in the env example from your screenshots. If EmailJS is not configured, the sender details are still saved and the form reports that email delivery is unavailable.

This is a production-oriented baseline, not a claim of formal certification. Set `TRUST_PROXY_HOPS` only to the exact number of trusted proxy hops. Keep secrets out of every `VITE_*` variable. The production admin and API must use HTTPS and a shared schemeful site or a same-origin API proxy so browser session cookies work.

## Deployment

- Build the root public frontend with `npm run build`; deploy its `dist/` folder and set `VITE_API_URL`.
- Build the admin frontend from `admin/` with `npm run build`; deploy its `dist/` folder and set `VITE_API_URL` (and optionally `VITE_PUBLIC_URL`).
- Deploy `backend/` as a Node.js service using `npm ci --omit=dev` and `npm start`. Configure `MONGODB_URI`, `MONGODB_DB_NAME`, admin secrets, exact HTTPS origins, and `NODE_ENV=production` in the platform secret manager.
- Before release, replace the API placeholder in each static-host CSP with the exact API origin. Do not expose MongoDB publicly; restrict network access to the API and initializer.

## Checks

Run `npm run security:check` for linting, API syntax/schema tests, and production frontend builds. Run `npm run security:audit` for dependency advisories. MongoDB-backed integration checks require a configured test database and non-production credentials.
