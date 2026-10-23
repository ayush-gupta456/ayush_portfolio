import { z } from "zod";

const safeText = (max) => z.string().trim().min(1).max(max);
const httpsUrl = z.string().max(2000).url().refine((value) => {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}, "Links must use HTTPS.");

export const profileSchema = z.object({
  portraitUrl: httpsUrl.optional(),
  resumeUrl: httpsUrl.optional(),
  name: safeText(100),
  initials: safeText(8),
  role: safeText(120),
  location: safeText(160),
  email: z.string().trim().email().max(254),
  phone: safeText(40),
  links: z.object({
    github: httpsUrl,
    linkedin: httpsUrl,
    leetcode: httpsUrl,
    codeforces: httpsUrl,
  }).strict(),
  codingProfiles: z.array(z.object({
    platform: safeText(60),
    solved: safeText(40),
    highlight: safeText(80),
    url: httpsUrl,
  }).strict()).max(12),
  education: z.object({
    school: safeText(160), degree: safeText(120), graduation: safeText(80), gpa: safeText(30),
  }).strict(),
  experience: z.array(z.object({
    kind: safeText(60), title: safeText(140), organization: safeText(160), period: safeText(100), description: safeText(1200),
  }).strict()).max(30),
  skills: z.array(z.object({ category: safeText(100), items: z.array(safeText(80)).max(80) }).strict()).max(30),
  currentProject: z.object({
    title: safeText(140), status: safeText(80), stack: z.array(safeText(80)).max(30), description: safeText(1600),
  }).strict(),
  projects: z.array(z.object({
    number: safeText(8), title: safeText(140), type: safeText(100), description: safeText(1200),
    stack: z.array(safeText(80)).max(30), live: httpsUrl, source: httpsUrl, visual: safeText(60), imageUrl: httpsUrl.optional(),
  }).strict()).max(40),
  certifications: z.array(z.object({
    title: safeText(180), issuer: safeText(120), category: safeText(80),
    url: httpsUrl.optional(),
    fileId: z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/).optional(), image: httpsUrl.optional(),
  }).strict()).max(100),
}).strict();

const singleLine = max => safeText(max).refine(value=>[...value].every(char=>char.codePointAt(0)>31&&char.codePointAt(0)!==127), "Use a single line without control characters.");
export const contactSchema = z.object({
  submissionId: z.string().uuid().optional(),
  name: singleLine(100),
  email: z.string().trim().email().max(254),
  subject: singleLine(120),
  message: safeText(3000),
  website: z.string().max(200).optional(),
}).strict();

