import { createHmac } from 'node:crypto';

// Stable across processes; rotating any owner credential invalidates old sessions.
// Use the high-entropy MFA secret as the key, never the randomly salted password hash.
export function credentialVersion(email, password, totpSecret) {
  return createHmac('sha256', totpSecret)
    .update(JSON.stringify(['portfolio-admin-v1', email, password]))
    .digest('hex');
}
