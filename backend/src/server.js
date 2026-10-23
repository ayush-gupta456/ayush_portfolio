import { originMatches as matchOrigin, originGuard, csrfGuard } from './origin.js';
import { registerNotes } from './notes.js';
import argon2 from "argon2";
import cors from "cors";
import { createMailDomainCheck } from './contact-domain.js';
import { registerContact, sendContactDailyLimitResponse } from './contact.js';
import { config as loadEnv } from "dotenv";
import express from "express";
import helmet from "helmet";
import { MongoClient } from "mongodb";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { verify as verifyTotp } from "otplib";
import { z } from "zod";
import { profileSchema } from "./schema.js";
import { detectMedia, uploadMedia } from "./media.js";

// Resolve the API env file from this source file so `node src/server.js` works
// regardless of whether the caller is in the repo root, backend/, or backend/src/.
loadEnv({ path: new URL("../.env", import.meta.url) });

const isProduction = process.env.NODE_ENV === "production";
const apiPort = Number(process.env.PORT || 8787);
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const totpSecret = process.env.ADMIN_TOTP_SECRET;
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME || "ayush_portfolio";
const emailJs = {
  serviceId: process.env.EMAILJS_SERVICE_ID?.trim(),
  publicKey: process.env.EMAILJS_PUBLIC_KEY?.trim(),
  privateKey: process.env.EMAILJS_PRIVATE_KEY?.trim(),
  mainTemplateId: process.env.EMAILJS_MAIN_TEMPLATE_ID?.trim() || "2pbte5s",
  autoReplyTemplateId: process.env.EMAILJS_AUTOREPLY_TEMPLATE_ID?.trim() || "9mhx1zf",
};
const adminOrigin = process.env.ADMIN_ORIGIN;
const publicOrigin = process.env.PUBLIC_ORIGIN;
const originMatches=(actual,expected)=>matchOrigin(actual,expected,isProduction);

const cookieSameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
const cookieName = process.env.SESSION_COOKIE_NAME || (isProduction ? "__Host-portfolio_admin" : "portfolio_admin");
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
const sessionDurationMs = 8 * 60 * 60 * 1000;
const emailJsConfigured = Boolean(emailJs.serviceId && emailJs.publicKey && emailJs.privateKey && emailJs.mainTemplateId && emailJs.autoReplyTemplateId);
let emailJsQueue = Promise.resolve();
let lastEmailJsSendAt = 0;
const domainAcceptsMail = createMailDomainCheck();
const contactEmailContract = "v1";
const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const token = (bytes = 32) => randomBytes(bytes).toString("base64url");
const safeEqual = (a, b) => { const left = Buffer.from(String(a)); const right = Buffer.from(String(b)); return left.length === right.length && timingSafeEqual(left, right); };
const mongo = new MongoClient(mongoUri || "mongodb://127.0.0.1:27017", { maxPoolSize: 10, minPoolSize: 0, serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, retryWrites: true, appName: "ayush-portfolio-api" });
let db;
const col = (name) => db.collection(name);

function assertConfig() {
  const missing = [["MONGODB_URI", mongoUri], ["ADMIN_EMAIL", adminEmail], ["ADMIN_PASSWORD", adminPassword], ["ADMIN_TOTP_SECRET", totpSecret], ["PUBLIC_ORIGIN", publicOrigin], ["ADMIN_ORIGIN", adminOrigin]].filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing required environment settings: ${missing.join(", ")}`);
  if (!z.string().email().safeParse(adminEmail).success) throw new Error("ADMIN_EMAIL must be a valid email address.");
  if (!/^(mongodb|mongodb\+srv):\/\//i.test(mongoUri)) throw new Error("MONGODB_URI must use mongodb:// or mongodb+srv://.");
  if (isProduction && /^mongodb:\/\//i.test(mongoUri) && !/[?&](?:tls|ssl)=true(?:&|$)/i.test(mongoUri)) throw new Error("Production MONGODB_URI must enable TLS (use mongodb+srv:// or add tls=true).");
  if (!/^[a-zA-Z0-9_-]{1,63}$/.test(databaseName)) throw new Error("MONGODB_DB_NAME must be a valid database name.");
  if (adminPassword.length < 14) throw new Error("ADMIN_PASSWORD must contain at least 14 characters.");
  if (!/^[A-Z2-7]{20,}$/.test(totpSecret)) throw new Error("ADMIN_TOTP_SECRET must be a valid Base32 secret with at least 20 characters.");
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 3) throw new Error("TRUST_PROXY_HOPS must be an integer from 0 to 3 and match the deployed proxy chain.");
  if (!["lax", "strict", "none"].includes(cookieSameSite)) throw new Error("COOKIE_SAME_SITE must be lax, strict, or none.");
  for (const origin of [publicOrigin, adminOrigin]) { const parsed = new URL(origin); if (isProduction && parsed.protocol !== "https:") throw new Error("Public and admin origins must use HTTPS in production."); if (parsed.origin !== origin) throw new Error("PUBLIC_ORIGIN and ADMIN_ORIGIN must contain only the exact origin, with no path or trailing slash."); }
  if (isProduction && (!cookieName.startsWith("__Host-") || cookieSameSite === "none")) throw new Error("Production sessions require a __Host- cookie name and SameSite=Lax or Strict; deploy admin and API on the same site or proxy the API under the admin origin.");
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", trustProxyHops);
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] } }, crossOriginResourcePolicy: { policy: "same-site" }, referrerPolicy: { policy: "no-referrer" }, strictTransportSecurity: isProduction ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false }));
app.use(cors({ origin: (origin, callback) => callback(null, [publicOrigin, adminOrigin].some(allowed => originMatches(origin, allowed))), credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"], allowedHeaders: ["Content-Type", "X-CSRF-Token", "X-Content-Version"], maxAge: 600 }));
app.use(express.json({ limit: "64kb", strict: true, type: "application/json" }));
app.use((_req, res, next) => { res.setHeader("Cache-Control", "no-store"); res.setHeader("X-Content-Type-Options", "nosniff"); next(); });

function persistentRateLimit({ name, limit, windowMs, key = (req) => req.ip || "unknown", message, onLimit }) {
  return async (req, res, next) => {
    const now = Date.now(); const windowStartMs = Math.floor(now / windowMs) * windowMs; const keyHash = hashToken(`${name}:${key(req)}`);
    try {
      const result = await col("api_rate_limits").findOneAndUpdate({ _id: keyHash }, [{ $set: { hits: { $cond: [{ $lt: [{ $ifNull: ["$windowStartedAt", new Date(0)] }, new Date(windowStartMs)] }, 1, { $add: [{ $ifNull: ["$hits", 0] }, 1] }] }, windowStartedAt: { $cond: [{ $lt: [{ $ifNull: ["$windowStartedAt", new Date(0)] }, new Date(windowStartMs)] }, new Date(windowStartMs), "$windowStartedAt"] }, expiresAt: new Date(now + 2 * 24 * 60 * 60 * 1000) } }], { upsert: true, returnDocument: "after", includeResultMetadata: false });
      const hits = result.hits; const remaining = Math.max(0, limit - hits); res.setHeader("RateLimit-Policy", `${limit};w=${Math.ceil(windowMs / 1000)}`); res.setHeader("RateLimit", `"default";r=${remaining};t=${Math.ceil((windowStartMs + windowMs - now) / 1000)}`);
      if (hits > limit) {
        res.setHeader("Retry-After", String(Math.max(1, Math.ceil((windowStartMs + windowMs - now) / 1000))));
        if (onLimit) return await onLimit(req, res, new Date(now));
        return res.status(429).json({ error: message });
      }
      return next();
    } catch (error) { return next(error); }
  };
}
const apiLimiter = persistentRateLimit({ name: "api-ip", limit: 180, windowMs: 15 * 60 * 1000, message: "Too many requests. Try again later." });
const loginPairLimiter = persistentRateLimit({ name: "login-email-ip", limit: 5, windowMs: 15 * 60 * 1000, key: (req) => `${req.ip || "unknown"}:${String(req.body?.email || "").trim().toLowerCase()}`, message: "Sign-in temporarily limited. Try again later." });
const loginAccountLimiter = persistentRateLimit({ name: "login-email", limit: 12, windowMs: 15 * 60 * 1000, key: (req) => String(req.body?.email || "").trim().toLowerCase(), message: "Sign-in temporarily limited. Try again later." });
async function contactIpLimitResponse(req, res, now) {
  const parsedEmail = z.string().trim().email().max(254).safeParse(req.body?.email);
  if (parsedEmail.success) {
    const keyHash = hashToken(`contact-email:${parsedEmail.data.toLowerCase()}`);
    const record = await col("api_rate_limits").findOne({ _id: keyHash }, { projection: { recentContactSubmissions: 1 } });
    const cutoff = now.getTime() - 24 * 60 * 60 * 1000;
    const recent = (record?.recentContactSubmissions || []).filter((sentAt) => sentAt instanceof Date && sentAt.getTime() > cutoff);
    if (recent.length >= 2) return sendContactDailyLimitResponse(res, recent, now);
  }
  return res.status(429).json({ error: "Message limit reached. Please try again later." });
}
const contactLimiter = persistentRateLimit({ name: "contact-ip", limit: 4, windowMs: 60 * 60 * 1000, message: "Message limit reached. Please try again later.", onLimit: contactIpLimitResponse });
app.use("/api", apiLimiter);

const requireOrigin=origin=>originGuard(origin,{isProduction});
const requireAdminOrigin = requireOrigin(adminOrigin);
function readCookie(req, name) { const pair = req.headers.cookie?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`)); if (!pair) return ""; try { return decodeURIComponent(pair.slice(name.length + 1)); } catch { return ""; } }
async function adminSession(req, res, next) {
  const raw = readCookie(req, cookieName); if (!raw || raw.length > 128) return res.status(401).json({ error: "Sign in to continue." });
  try { const session = await col("admin_sessions").findOne({ _id: hashToken(raw), credentialVersion: app.locals.credentialVersion, expiresAt: { $gt: new Date() } }); if (!session) return res.status(401).json({ error: "Sign in to continue." }); req.session = session; return next(); } catch (error) { return next(error); }
}
const requireCsrf=csrfGuard(safeEqual);
const adminGuard = [originGuard(adminOrigin,{isProduction,allowSameOriginReads:true}), adminSession]; const mutateGuard = [...adminGuard, requireCsrf];
const audit = (action, req) => col("admin_audit").insertOne({ action, ipHash: hashToken(req.ip || "unknown"), createdAt: new Date() });

app.post('/api/admin/media', mutateGuard,
  persistentRateLimit({ name: 'media-upload', limit: 20, windowMs: 60 * 60 * 1000, message: 'Upload limit reached. Try again next hour.' }),
  express.raw({ type: 'application/octet-stream', limit: '10mb' }),
  async (req, res) => {
    if (!detectMedia(req.body)) return res.status(400).json({ error: 'Choose a JPEG, PNG, WebP image or PDF (maximum 10 MB).' });
    try {
      const asset = await uploadMedia(req.body);
      return res.status(201).json({ asset });
    } catch (error) {
      console.error(JSON.stringify({ event: 'media.upload.failed', message: error.message }));
      return res.status(502).json({ error: 'Upload failed. Check the Cloudinary configuration and try again.' });
    }
  });

function queueEmailJsSend(templateId, templateParams) {
  const send = emailJsQueue.then(async () => {
    const delay = Math.max(0, 1100 - (Date.now() - lastEmailJsSendAt));
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    lastEmailJsSendAt = Date.now();
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      // EmailJS's domain allowlist checks the Origin header. Use the API's
      // configured public origin, never an untrusted value supplied by a caller.
      headers: { "Content-Type": "application/json", Origin: publicOrigin },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ service_id: emailJs.serviceId, template_id: templateId, user_id: emailJs.publicKey, accessToken: emailJs.privateKey, template_params: templateParams }),
    });
    if (!response.ok) {
      const diagnostic = (await response.text()).replace(/[\r\n\t]+/g, " ").trim().slice(0, 240);
      throw new Error(`EmailJS returned HTTP ${response.status}${diagnostic ? `: ${diagnostic}` : "."}`);
    }
  });
  emailJsQueue = send.catch(() => {});
  return send;
}

async function sendContactEmails({ name, email, subject, message }) {
  if (!emailJsConfigured) return { mainSent: false, autoReplySent: false };
  const templateParams = { from_name: name, from_email: email, email, to_name: name, to_email: email, subject, message, current_time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) };
  const delivery = { mainSent: false, autoReplySent: false };
  for (const [key, templateId] of [["mainSent", emailJs.mainTemplateId], ["autoReplySent", emailJs.autoReplyTemplateId]]) {
    try {
      await queueEmailJsSend(templateId, templateParams);
      delivery[key] = true;
    } catch (error) {
      console.error(JSON.stringify({ event: "emailjs.contact.failed", template: key, detail: error.message }));
    }
  }
  return delivery;
}

app.get("/api/health", async (_req, res, next) => { try { await db.command({ ping: 1 }); return res.json({ status: "ok", contactEmailContract }); } catch (error) { return next(error); } });
app.get("/api/public/profile", async (_req, res, next) => { try { const doc = await col("portfolio_content").findOne({ _id: "profile" }, { projection: { _id: 0 } }); if (!doc) return res.status(503).json({ error: "Portfolio content is not initialized." }); res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300"); return res.json({ profile: profileSchema.parse(doc.document), version: doc.version, updatedAt: doc.updatedAt }); } catch (error) { return next(error); } });
registerContact(app,{col,guards:[requireOrigin(publicOrigin),contactLimiter],domainAcceptsMail,sendContactEmails,emailJsConfigured});
app.post("/api/admin/auth/login", requireAdminOrigin, loginPairLimiter, loginAccountLimiter, async (req, res, next) => {
  const bodySchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(256), code: z.string().regex(/^\d{6}$/) }).strict(); const parsed = bodySchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Enter your email, password, and six-digit authenticator code." });
  try { const passwordValid = await argon2.verify(app.locals.passwordHash, parsed.data.password).catch(() => false); const accountValid = safeEqual(parsed.data.email.trim().toLowerCase(), adminEmail); const otp = await verifyTotp({ secret: totpSecret, token: parsed.data.code }); if (!passwordValid || !accountValid || !otp.valid) return res.status(401).json({ error: "The credentials or authenticator code are incorrect." }); const timeStep = Math.floor(Date.now() / 30_000) + otp.delta;
    try { await col("admin_totp_uses").insertOne({ _id: timeStep, usedAt: new Date() }); } catch (error) { if (error.code === 11000) return res.status(401).json({ error: "The authenticator code has already been used. Wait for a new code and try again." }); throw error; }
    const rawSession = token(); const csrfToken = token(32); const expiresAt = new Date(Date.now() + sessionDurationMs); await col("admin_sessions").insertOne({ _id: hashToken(rawSession), csrfToken, credentialVersion: app.locals.credentialVersion, createdAt: new Date(), expiresAt }); res.cookie(cookieName, rawSession, { httpOnly: true, secure: isProduction, sameSite: cookieSameSite, path: "/", maxAge: sessionDurationMs }); await audit("admin.login", req); return res.json({ authenticated: true, csrfToken, expiresAt });
  } catch (error) { return next(error); }
});
app.get("/api/admin/auth/session", adminGuard, (req, res) => res.json({ authenticated: true, csrfToken: req.session.csrfToken }));
app.post("/api/admin/auth/logout", mutateGuard, async (req, res, next) => { try { await col("admin_sessions").deleteOne({ _id: req.session._id }); res.clearCookie(cookieName, { httpOnly: true, secure: isProduction, sameSite: cookieSameSite, path: "/" }); return res.json({ authenticated: false }); } catch (error) { return next(error); } });
app.get("/api/admin/profile", adminGuard, async (_req, res, next) => { try { const doc = await col("portfolio_content").findOne({ _id: "profile" }, { projection: { _id: 0 } }); if (!doc) return res.status(503).json({ error: "Portfolio content is not initialized." }); return res.json({ profile: profileSchema.parse(doc.document), version: doc.version, updatedAt: doc.updatedAt }); } catch (error) { return next(error); } });
app.put("/api/admin/profile", mutateGuard, async (req, res, next) => { const expectedVersion = Number(req.get("X-Content-Version")); if (!req.get("X-Content-Version") || !Number.isInteger(expectedVersion) || expectedVersion < 0) return res.status(400).json({error:"Reload the editor before saving."}); const parsed = profileSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Portfolio content failed validation.", details: parsed.error.issues.map(({ path, message }) => ({ path: path.join("."), message })) }); try { const now = new Date(); const result = await col("portfolio_content").updateOne({ _id: "profile", version: expectedVersion }, { $set: { document: parsed.data, updatedAt: now }, $inc: { version: 1 } }); if (!result.matchedCount) return res.status(409).json({ error: "The portfolio changed in another editor. Reload before saving to avoid overwriting it." }); const updated = await col("portfolio_content").findOne({ _id: "profile" }, { projection: { version: 1, updatedAt: 1 } }); await audit("portfolio.update", req); return res.json({ success: true, version: updated.version, updatedAt: updated.updatedAt }); } catch (error) { return next(error); } });
app.get("/api/admin/messages", adminGuard, async (_req, res, next) => { try { const contacts = await col("contact_messages").find({}, { projection: { name: 1, email: 1 } }).sort({ _id: -1 }).limit(100).toArray(); return res.json({ messages: contacts.map(({ _id, ...contact }) => ({ ...contact, id: _id.toString(), createdAt: _id.getTimestamp() })) }); } catch (error) { return next(error); } });
registerNotes(app, { col, adminGuard, mutateGuard, requireOrigin, publicOrigin, persistentRateLimit });
app.use((_req, res) => res.status(404).json({ error: "Not found." }));
app.use((error, req, res, _next) => { void _next; const requestId = token(12); console.error(JSON.stringify({ requestId, method: req.method, path: req.path, error: error.message })); if (res.headersSent) return; return res.status(error.type === "entity.too.large" ? 413 : error.type === "entity.parse.failed" ? 400 : 500).json({ error: error.type === "entity.too.large" ? "Request is too large." : error.type === "entity.parse.failed" ? "Invalid JSON request." : "The request could not be completed.", requestId }); });

export async function startServer() {
  assertConfig(); app.locals.passwordHash = await argon2.hash(adminPassword, { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 }); app.locals.credentialVersion = hashToken(`${app.locals.passwordHash}:${totpSecret}`);
  await mongo.connect(); db = mongo.db(databaseName); if (!await col("portfolio_content").findOne({ _id: "profile" }, { projection: { _id: 1 } })) throw new Error("MongoDB is not initialized. Run `npm run init-db` before starting the API.");
  const server = app.listen(apiPort, () => console.info(`API listening on port ${apiPort} (contact email contract ${contactEmailContract}; EmailJS ${emailJsConfigured ? "configured" : "not configured"})`)); const shutdown = () => server.close(async () => { await mongo.close(); process.exit(0); }); process.once("SIGINT", shutdown); process.once("SIGTERM", shutdown); return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) startServer().catch(async (error) => { console.error(error.message); await mongo.close(); process.exit(1); });
