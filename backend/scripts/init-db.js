import { config as loadEnv } from "dotenv";
import { MongoClient } from "mongodb";
import { profile } from "../../src/data/profile.js";
import { profileSchema } from "../src/schema.js";

loadEnv({ path: new URL("../.env", import.meta.url) });

const uri = process.env.MONGODB_INIT_URI || process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME || "ayush_portfolio";
if (!uri) throw new Error("Set MONGODB_INIT_URI (or MONGODB_URI for local development) before initializing MongoDB.");
if (!/^(mongodb|mongodb\+srv):\/\//i.test(uri)) throw new Error("MongoDB URI must use mongodb:// or mongodb+srv://.");

const client = new MongoClient(uri, { maxPoolSize: 2, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, appName: "ayush-portfolio-db-initializer" });
try {
  await client.connect();
  const db = client.db(databaseName);
  for (const name of ["portfolio_content", "admin_sessions", "admin_totp_uses", "contact_messages", "admin_audit", "api_rate_limits", "notes", "note_uploads", "subscribers"]) await db.createCollection(name).catch((error) => { if (error.codeName !== "NamespaceExists") throw error; });
  await db.collection("admin_sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "sessions_expiry_ttl" });
  await db.collection("admin_totp_uses").createIndex({ usedAt: 1 }, { expireAfterSeconds: 172800, name: "totp_expiry_ttl" });
  await db.collection("contact_messages").createIndex({ createdAt: -1 }, { name: "messages_created" });
  await db.collection("admin_audit").createIndex({ createdAt: -1 }, { name: "audit_created" });
  await db.collection("api_rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "rate_limits_expiry_ttl" });
  await db.collection("note_uploads").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("notes").createIndex({ status: 1, updatedAt: -1 });
  const validatedProfile = profileSchema.parse(profile);
  await db.collection("portfolio_content").updateOne({ _id: "profile" }, { $setOnInsert: { document: validatedProfile, version: 1, updatedAt: new Date() } }, { upsert: true });
  console.info(`MongoDB database '${databaseName}' is ready.`);
} finally { await client.close(); }
