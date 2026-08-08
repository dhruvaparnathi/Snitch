import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useAuth } from '../hook/useAuth';

/* ── SVG icon primitives ─────────────────────────────────────────────── */
const icons = {
  person: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor"/>
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
  shoppingBag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  storefront: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <path d="M3 9l1-6h16l1 6"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M5 9v12h14V9"/>
    </svg>
  ),
};

/* ── Google icon ─────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Password strength helper ────────────────────────────────────────── */
function getStrength(val) {
  let s = 0;
  if (val.length > 5)  s++;
  if (val.length > 8)  s++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) s++;
  if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) s++;
  return s;
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];

/* ── Left branding panel (re-exported for Login to use) ─────────────── */
export function BrandPanel() {
  return (
    <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden">
      {/* Background illustration */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(135deg, rgba(29,16,63,0.85) 0%, rgba(17,6,45,0.65) 100%)', mixBlendMode: 'multiply' }}
        />
        <img
          alt="Abstract glowing geometric marketplace illustration"
          className="object-cover w-full h-full"
          style={{ opacity: 0.85, mixBlendMode: 'screen' }}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL3xBM5-NHW6mtzDvHQ2zq2fHwYKsMPqfWUPY9LysFkyn1MkXvvaHGwJ_P1k3C30a-jRV16x3N9c8csJ4oxcgj0JMONHPIiCbG-fgGxxUKGTCM8vMnUZaPZh7btpa8tjLdk2rNzxXD-b6I8oAqPR6ZEY9Nf2at7cdRbFYfAsuNgDOWPpXsu9iEBa54ZHyLeMR-x2DxDvFPkAKf09IkWs-zvYE2jt1GW8qCj9ERJoNl2nhJaZRmAtA7nybRalVywM8y1B9XYgXJyvw"
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-20 p-12 flex flex-col h-full justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border"
            style={{ background: 'var(--color-surface-container-highest)', borderColor: 'rgba(122,111,155,0.3)' }}
          >
            <img alt="Snitch Logo" className="w-8 h-8 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2EignFcmYho--Y5xa2JhpAiPQXwx9phrM7-b6Qzg9Uq2PoZdfq5elwlsP-4B9c9yXRhiZAraD4zP11m-IX-OkrdJ3psMFVTXhKvrt-B1HSj22LQObrXMzKHHj58VpOigpNJGVQNuypWHaB0p0YuNK2YTkzEIwy1NK81jx6Njq1o_OVHSoBDalFjgpRaGyXWQotC4iZygXqdR9G2VUd92G4fNpySLTp5rWt8U7XnLc11dIicIP7K9kERvlhzTc9TzEaf_MNuA30Qo"
            />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--color-on-background)', letterSpacing: '-0.01em' }}>
            Snitch
          </span>
        </div>

        {/* Tagline */}
        <div className="max-w-md">
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '3.2rem', fontWeight: 600, lineHeight: 1.1, color: 'var(--color-on-background)', marginBottom: '1rem' }}>
            Connect.<br />
            <span className="gradient-text">Trade.</span><br />
            Succeed.
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Join the premier marketplace ecosystem designed for high-performing buyers and sellers.
          </p>
        </div>

        {/* Footer links */}
        <div className="flex gap-6 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          {['Terms', 'Privacy'].map(t => (
            <a key={t} href="#"
              style={{ transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-on-surface-variant)'}
            >{t}</a>
          ))}
        </div>
      </div>
    </div>
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

/* ── Register page ───────────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();
  const { loading, error } = useSelector(s => s.auth);

  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', role: 'buyer' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState({});

  const strength = getStrength(form.password);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setFieldError(fe => ({ ...fe, [e.target.name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldError(errs); return; }
    try {
      await handleRegister(form);
      navigate('/');
    } catch {/* shown via redux */}
  }

  const strengthColors = [null, 'var(--color-error)', 'var(--color-tertiary)', 'var(--color-primary)', '#34A853'];

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <BrandPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-4 relative overflow-y-auto" style={{ background: 'var(--color-background)' }}>
        <div className="glass-card rounded-2xl p-6 w-full max-w-md my-auto">
          {/* Header */}
          <div className="mb-4 text-center">
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-on-background)', marginBottom: '0.2rem' }}>
              Create Account
            </h2>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.8rem' }}>
              Join thousands of buyers and sellers on Snitch
            </p>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(167,1,56,0.2)', border: '1px solid var(--color-error)', color: 'var(--color-error)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Role selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>I want to</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'buyer', icon: icons.shoppingBag },
                  { id: 'seller', icon: icons.storefront },
                ].map(({ id, icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: id }))}
                    className="role-card flex flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-lg focus:outline-none"
                    style={{
                      background: form.role === id ? 'rgba(153,149,255,0.12)' : 'var(--color-surface-variant)',
                      borderColor: form.role === id ? 'var(--color-primary)' : 'rgba(76,66,106,0.5)',
                    }}
                  >
                    <span style={{ color: form.role === id ? 'var(--color-primary)' : 'var(--color-on-surface-variant)', display: 'flex' }}>{icon}</span>
                    <span className="text-sm font-medium capitalize" style={{ color: 'var(--color-on-surface)' }}>{id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Full Name</label>
              <InputField id="fullName" name="fullName" type="text" placeholder="John Doe" value={form.fullName} onChange={handleChange} icon={icons.person} />
              {fieldError.fullName && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{fieldError.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Email Address</label>
              <InputField id="email" name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} icon={icons.mail} />
              {fieldError.email && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{fieldError.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Mobile Number</label>
              <InputField id="mobile" name="mobile" type="tel" placeholder="+91 00000 00000" value={form.mobile} onChange={handleChange} icon={icons.phone} />
              {fieldError.mobile && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{fieldError.mobile}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Password</label>
              <InputField
                id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••" value={form.password} onChange={handleChange} icon={icons.lock}
                rightNode={
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="focus:outline-none flex" style={{ color: 'var(--color-on-surface-variant)', transition: 'color .2s' }}>
                    {showPassword ? icons.eyeOff : icons.eye}
                  </button>
                }
              />
              {form.password.length > 0 && (
                <div className="flex gap-1 mt-1.5" style={{ height: 3 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-1 rounded-full transition-all duration-300" style={{ background: i <= strength ? strengthColors[strength] : 'var(--color-surface-variant)' }} />
                  ))}
                </div>
              )}
              {fieldError.password && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{fieldError.password}</p>}
            </div>

            {/* Submit */}
            <button id="register-submit" type="submit" disabled={loading}
              className="w-full primary-gradient-btn py-3 rounded-lg text-sm font-semibold disabled:opacity-60"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
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
          <p className="text-center mt-4 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
