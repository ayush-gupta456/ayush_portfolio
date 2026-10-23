import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { uploadMedia, detectMedia } from '../src/media.js';
import { profileSchema } from '../src/schema.js';
config({ path: new URL('../.env', import.meta.url), quiet: true });
const root = new URL('../../', import.meta.url);
const certificateFiles = {
  'Software Engineer': 'software_engineer certificate - hackerrank.pdf',
  'Problem Solving (Basic)': 'problem_solving_basic certificate - hackerrank.pdf',
  'Web Development': 'webd certificate - Infosys.pdf',
  'CSS3': 'css3 _springboard - Infosys.pdf',
  'React, Next.js & Redux': 'udemy react.pdf',
  'MongoDB': 'MongoDb.pdf',
  'Adobe Hackathon': 'adobe_hackathon.pdf',
  'Cloud Computing': 'cloud computing - Microsoft.pdf',
  'Benefits of Cloud Services': 'Describe the benefits of using cloud services microsoft.pdf',
  'Cloud Service Types': 'dexcribe cloud service types - microsoft.pdf',
  'AWS Cloud Computing Training': 'jovac_aws_certi_ayush .pdf',
};
const ledgerPath = new URL('backend/migrations/cloudinary-media.json', root);
await mkdir(new URL('backend/migrations/', root), { recursive: true });
let ledger = {};
try { ledger = JSON.parse(await readFile(ledgerPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
async function migrate(bytes, label) {
  if (!detectMedia(bytes) || bytes.length > 10 * 1024 * 1024) throw new Error(`Invalid media: ${label}`);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (!ledger[hash]) {
    ledger[hash] = { ...await uploadMedia(bytes), label };
    await writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
  }
  const response = await fetch(ledger[hash].url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Delivery failed for ${label}: ${response.status}`);
  const delivered = Buffer.from(await response.arrayBuffer());
  if (createHash('sha256').update(delivered).digest('hex') !== hash) throw new Error(`Delivery checksum mismatch: ${label}`);
  console.log(`Verified: ${label}`);
  return ledger[hash].url;
}
try {
  await client.connect();
  const collection = client.db(process.env.MONGODB_DB_NAME || 'ayush_portfolio').collection('portfolio_content');
  const saved = await collection.findOne({ _id: 'profile' });
  if (!saved) throw new Error('Initialize the database first.');
  const next = structuredClone(saved.document);
  next.portraitUrl = next.portraitUrl || await migrate(await readFile(new URL('public/profile_pic.jpeg', root)), 'Portrait');
  next.resumeUrl = next.resumeUrl || await migrate(await readFile(new URL('public/resume/Ayush_resume.pdf', root)), 'Resume');
  const pending = [];
  for (const certificate of next.certifications) {
    if (certificate.url?.includes('res.cloudinary.com/')) continue;
    try {
      let bytes;
      if (certificateFiles[certificate.title]) bytes = await readFile(`F:/certificates/${certificateFiles[certificate.title]}`);
      else if (certificate.image?.startsWith('/certificates/')) bytes = await readFile(new URL(`public${certificate.image}`, root));
      else if (certificate.fileId) {
        const response = await fetch(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(certificate.fileId)}`, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`Drive returned ${response.status}`);
        bytes = Buffer.from(await response.arrayBuffer());
      } else throw new Error('No source file');
      certificate.url = await migrate(bytes, certificate.title);
      delete certificate.image;
      delete certificate.fileId;
    } catch (error) { pending.push(certificate.title); console.warn(`Pending: ${certificate.title}: ${error.message}`); }
  }
  profileSchema.parse(next);
  const result = await collection.updateOne({ _id: 'profile', version: saved.version }, { $set: { document: next, updatedAt: new Date() }, $inc: { version: 1 } });
  if (!result.matchedCount) throw new Error('Profile changed during migration. Run again to merge safely.');
  await writeFile(new URL('src/data/profile.js', root), `// Public fallback snapshot; the admin-managed API is authoritative.\nexport let profile = ${JSON.stringify(next, null, 2)};\nexport function replaceProfile(nextProfile) { profile = nextProfile; }\n`);
  console.log(`Saved Cloudinary URLs to MongoDB and fallback snapshot. Pending certificates: ${pending.length}`);
} finally { await client.close(); }
