# Portfolio API

Express 5 API for the public portfolio and separate admin app. MongoDB stores portfolio content, sessions, MFA replay guards, contact submissions, audit events, and persistent rate limits.

## Local setup

1. Install Node.js 22 LTS and use local MongoDB or MongoDB Atlas.
2. Copy `.env.example` to `.env`; set `MONGODB_URI`, database name, exact local origins, a unique admin password of at least 14 characters, and a Base32 TOTP secret. Keep `.env` private. The server and initializer load `backend/.env` based on their own file locations, including when you launch `node server.js` from `backend/src`.
3. Generate an MFA seed and enrollment URI using `npm run mfa:setup`; enroll it in your authenticator app and store the seed in `ADMIN_TOTP_SECRET`.
4. Run `npm install`, `npm run init-db`, then `npm run dev` from the `backend/` directory (or run the corresponding `--prefix backend` commands from the repository root).

If startup reports `ADMIN_TOTP_SECRET must be a valid Base32 secret`, generate a fresh seed with `npm run mfa:setup`, enroll it in your authenticator app, and copy only the Base32 seed into `ADMIN_TOTP_SECRET`—not the `otpauth://` provisioning URI. Restart the API after saving `.env`.

The initializer creates collections and indexes and seeds the first profile document. In production, use a temporary credential with database administration rights for initialization and a dedicated least-privilege account for the API runtime. Never give the API deployment the initializer credential.

## Routes

- `GET /api/public/profile`: public portfolio document.
- `POST /api/public/contact`: validated contact message, honeypot, and database-backed per-IP and per-email limits.
- `POST /api/admin/auth/login`: email, password, and TOTP code.
- `GET /api/admin/auth/session`: recover the CSRF token for an existing session.
- `POST /api/admin/auth/logout`: revoke the current session.
- `GET /api/admin/profile`, `PUT /api/admin/profile`: read and edit portfolio content.
- `GET /api/admin/messages`: private list of contact names, email addresses, and submission times.

## Production

Deploy this directory as a Node.js API service with a managed MongoDB database using TLS and network access lists. Configure exact HTTPS origins, `NODE_ENV=production`, a `__Host-` session cookie, SameSite Lax or Strict, and only trusted proxy hops. Store secrets in the platform secret manager; none belong in frontend `VITE_*` variables. Keep the admin and API on the same schemeful site or use a same-origin API proxy. Restrict MongoDB network access to application services, encrypt backups, and test restore procedures.

TTL indexes clean up expired session and rate-limit records asynchronously; all authentication checks still enforce the expiry timestamp. Rate limit updates are stored in MongoDB so all API replicas share them.

## EmailJS contact delivery

The API validates email syntax and checks that the domain has MX records (or an A-record mail fallback) before accepting a contact request; this cannot guarantee that an individual mailbox exists. Each normalized email address can submit at most two messages in a rolling 24-hour period. On reaching the limit, the form tells the sender to contact Ayush directly after 6:00 PM IST and provides a mail link. A separate limit of four submissions per IP per hour also applies. Valid contact submissions send the full form content through EmailJS to the site owner and a confirmation auto-reply to the sender. The API attempts these sends independently. Each new MongoDB contact document stores only the sender's name and email (plus MongoDB's generated `_id`); subject and message content are not persisted. The inbox derives an approximate submission time from that generated ID. Enter `EMAILJS_SERVICE_ID`, `EMAILJS_PUBLIC_KEY`, and `EMAILJS_PRIVATE_KEY` in the ignored `backend/.env`; never put the private key in a frontend `VITE_*` variable. The main template expects `from_name`, `from_email`/`email`, `subject`, `message`, and `current_time`; the auto-reply expects `to_email`, `to_name`, `subject`, and `message`. Restart the API after changing these values. Without the three account values, the sender's name and email are saved but the email sends are skipped and the form indicates that email delivery is not configured.

In the EmailJS main template, use the connected service's default From Email and set Reply-To to `{{from_email}}` so replies reach the sender. The API spaces queued template sends to respect EmailJS's one-request-per-second limit.

If EmailJS history reports `Gmail_API: Invalid grant`, reconnect the Gmail service from **EmailJS → Email Services** and complete Google's authorization flow, then use **Test** on that service and restart the API. If the history reports insufficient authentication scopes, reconnect the service and approve the requested Gmail scopes. The API now attempts the main notification and auto-reply independently, so failure of one does not prevent trying the other.

Run `npm run init-db` before the API deploy, `npm run check` and `npm test` for checks, and `npm audit` before releases. Integration checks require a non-production MongoDB database and test secrets.
