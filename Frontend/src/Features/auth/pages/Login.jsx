import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useAuth } from '../hook/useAuth';
import { BrandPanel } from './Register';

/* ── SVG Icons ───────────────────────────────────────────────────────── */
const icons = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  ),
};

/* ── Google icon ─────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Reusable input wrapper ──────────────────────────────────────────── */
function InputField({ id, name, type = 'text', placeholder, value, onChange, icon, rightNode }) {
  return (
    <div className="input-field flex items-center px-3 py-2.5 rounded-lg gap-3">
      <span style={{ color: 'var(--color-on-surface-variant)', flexShrink: 0, display: 'flex' }}>{icon}</span>
      <input
        id={id} name={name} type={type} placeholder={placeholder}
        value={value} onChange={onChange}
        className="w-full bg-transparent border-none outline-none text-sm focus:ring-0 p-0"
        style={{ color: 'var(--color-on-background)', fontFamily: 'var(--font-body)' }}
        autoComplete="off"
      />
      {rightNode}
    </div>
  );
}


/* ── Login page ──────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const { loading, error } = useSelector(s => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldError, setFieldError] = useState({});

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setFieldError(fe => ({ ...fe, [e.target.name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldError(errs); return; }
    try {
      await handleLogin(form);
      navigate('/');
    } catch {/* shown via redux */}
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <BrandPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-4 relative" style={{ background: 'var(--color-background)' }}>
        <div className="glass-card rounded-2xl p-6 w-full max-w-md">
          {/* Header */}
          <div className="mb-6">
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-on-background)', marginBottom: '0.2rem' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.8rem' }}>
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(167,1,56,0.2)', border: '1px solid var(--color-error)', color: 'var(--color-error)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Email Address</label>
              <InputField id="login-email" name="email" type="email" placeholder="name@company.com" value={form.email} onChange={handleChange} icon={icons.mail} />
              {fieldError.email && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{fieldError.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Password</label>
              <InputField
                id="login-password" name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••" value={form.password} onChange={handleChange} icon={icons.lock}
                rightNode={
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="focus:outline-none flex" style={{ color: 'var(--color-on-surface-variant)', transition: 'color .2s' }}>
                    {showPassword ? icons.eyeOff : icons.eye}
                  </button>
                }
              />
              {fieldError.password && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{fieldError.password}</p>}
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                <input
                  id="remember-me" type="checkbox" checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded focus:ring-0"
                  style={{ accentColor: 'var(--color-primary)', width: 14, height: 14 }}
                />
                Remember me
              </label>
              <a href="#" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button id="login-submit" type="submit" disabled={loading}
              className="w-full primary-gradient-btn py-3 rounded-lg text-sm font-semibold disabled:opacity-60"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-grow" style={{ background: 'rgba(76,66,106,0.5)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>Or</span>
            <div className="h-px flex-grow" style={{ background: 'rgba(76,66,106,0.5)' }} />
          </div>

          {/* Google */}
          <button type="button"
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border text-sm font-medium transition-colors duration-200"
            style={{ borderColor: 'rgba(76,66,106,0.5)', background: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)' }}>
            <GoogleIcon />Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center mt-5 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
