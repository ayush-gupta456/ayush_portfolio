import { createHash, randomUUID } from 'node:crypto';

export function detectMedia(b) {
  if (!Buffer.isBuffer(b) || !b.length) return null;
  if (b.subarray(0, 5).toString() === '%PDF-') return { ext: 'pdf', type: 'application/pdf', resource: 'raw' };
  if (b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { ext: 'png', type: 'image/png', resource: 'image' };
  if (b[0] === 255 && b[1] === 216 && b[2] === 255) return { ext: 'jpg', type: 'image/jpeg', resource: 'image' };
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return { ext: 'webp', type: 'image/webp', resource: 'image' };
  return null;
}

export async function uploadMedia(buffer, trustedMedia = null) {
  const media = trustedMedia || detectMedia(buffer);
  if (!media) throw new Error('Unsupported file');
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !/^[a-zA-Z0-9_-]+$/.test(cloud) || !apiKey || !secret) throw new Error('Cloudinary is not configured');
  const publicId = `portfolio/${randomUUID()}${media.resource === 'raw' ? `.${media.ext}` : ''}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHash('sha256').update(`public_id=${publicId}&timestamp=${timestamp}${secret}`).digest('hex');
  const form = new FormData();
  form.set('file', new Blob([buffer], { type: media.type }), `asset.${media.ext}`);
  form.set('public_id', publicId);
  form.set('timestamp', timestamp);
  form.set('api_key', apiKey);
  form.set('signature', signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${media.resource}/upload`, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Cloudinary upload rejected (${response.status})`);
  const asset = await response.json();
  if (!asset.secure_url?.startsWith(`https://res.cloudinary.com/${cloud}/`)) throw new Error('Unexpected Cloudinary response');
  return { url: asset.secure_url, publicId: asset.public_id, type: media.type, bytes: asset.bytes };
}
