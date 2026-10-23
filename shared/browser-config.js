// Public build-time configuration only. Never add service credentials here.
export const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
  || (import.meta.env.DEV ? 'http://localhost:8787/api' : '/api');
