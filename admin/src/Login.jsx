import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react';
import { request } from './api.js';

export default function Login({ onLogin, initialMessage = '' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const lock = useRef(false);
  const feedback = useRef(null);
  useEffect(() => { if (error) feedback.current?.focus(); }, [error]);

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const form = event.currentTarget;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const data = Object.fromEntries(new FormData(form));
      data.email = data.email.trim();
      await request('/admin/auth/login', { method: 'POST', body: JSON.stringify(data) });
      // Confirm the browser returned the HttpOnly cookie before opening the workspace.
      let session;
      try {
        session = await request('/admin/auth/session');
      } catch (cause) {
        if (cause.status === 401) {
          throw Error(cause.code === 'SESSION_INVALID'
            ? 'Sign-in succeeded, but the session was invalidated. Check that all API instances use the same owner credentials and current deployment.'
            : 'Sign-in succeeded, but the session cookie was not accepted or returned. Check browser cookie permissions and the server’s secure-cookie configuration.');
        }
        throw cause;
      }
      await onLogin(session);
    } catch (cause) {
      setError(cause.message);
      form.elements.code.value = '';
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return <main className="login-screen"><section className="login-card">
    <span className="overline">PRIVATE WORKSPACE</span>
    <h1>Welcome back.</h1>
    <p className="login-intro">Manage your portfolio, resources and community submissions.</p>
    {initialMessage && !error && <p className="alert" role="status">{initialMessage}</p>}
    <form className="login-form" aria-busy={busy} onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend className="sr-only">Owner credentials</legend>
        <label htmlFor="admin-email">Email address<input id="admin-email" name="email" type="email" autoComplete="username" maxLength={254} required autoCapitalize="none" spellCheck={false}/></label>
        <div className="login-password-field">
          <label htmlFor="admin-password">Password</label>
          <div className="login-password-control">
            <input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" maxLength={256} required/>
            <button type="button" className="login-password-button" aria-controls="admin-password" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>
              {showPassword ? <EyeOff size={18} aria-hidden="true"/> : <Eye size={18} aria-hidden="true"/>}
              <span>{showPassword ? 'Hide' : 'Show'}</span>
            </button>
          </div>
        </div>
        <label htmlFor="admin-code">Authenticator code<input id="admin-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required onInput={event => { event.currentTarget.value = event.currentTarget.value.replace(/[^0-9]/g, ''); }}/></label>
      </fieldset>
      {error && <p ref={feedback} tabIndex={-1} role="alert" className="alert">{error}</p>}
      <button className="primary-button" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17}/> Verifying…</> : 'Sign in securely'}</button>
    </form>
    <p className="login-footnote"><ShieldCheck size={16} aria-hidden="true"/> Password and authenticator protection</p>
  </section></main>;
}
