import { API_BASE } from '../shared/browser-config.js';

export async function notesRequest(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}/public/${path}`, { ...options, signal: AbortSignal.timeout(options.body instanceof File ? 90000 : 30000) });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const retry = Number(response.headers.get('Retry-After'));
      const error = new Error(data?.error || (response.status === 413 ? 'This submission is too large. Shorten the explanation or reference links and try again.' : response.status === 429 ? `Too many requests. Try again${retry > 0 ? ` in ${Math.ceil(retry / 60)} minutes` : ' later'}.` : 'The service is unavailable. Your form has been kept; please try again.'));
      error.fieldErrors = data?.fieldErrors;
      throw error;
    }
    if (!data) throw new Error('The service returned an unexpected response. Your form has been kept.');
    return data;
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') throw new Error('The request timed out. Your form has been kept. Please try again.');
    if (error instanceof TypeError) throw new Error('Could not connect. Check your connection and try again. Your form has been kept.');
    throw error;
  }
}
