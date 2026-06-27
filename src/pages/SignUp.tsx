import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoCameraOutline,
} from 'react-icons/io5';
import { signInWithPopup } from 'firebase/auth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { authApi, userApi, tokenStore } from '../services/api';
import { auth, googleProvider } from '../config/firebase';
import { cn } from '../utils/helpers';

// Password strength calculation
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-rose-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-emerald-500' },
    { label: 'Very Strong', color: 'bg-emerald-600' },
  ];
  return { score, ...levels[score] };
}

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const strength = getPasswordStrength(password);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: 'Image must be under 5 MB' }));
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((p) => { const next = { ...p }; delete next.photo; return next; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) e.email = 'Enter a valid email address';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const { user, accessToken } = await authApi.register(name.trim(), email.trim(), password, confirm);
      tokenStore.set(accessToken);

      // Upload photo if selected
      if (photoFile) {
        try {
          const updated = await userApi.uploadAvatar(photoFile);
          login(updated, accessToken);
        } catch {
          login(user, accessToken); // proceed even if photo upload fails
        }
      } else {
        login(user, accessToken);
      }

      navigate('/dashboard');
    } catch (err: unknown) {
      setErrors({ general: (err as Error).message ?? 'Registration failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrors({});
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { user, accessToken } = await authApi.googleAuth(idToken);
      tokenStore.set(accessToken);
      login(user, accessToken);
      navigate('/dashboard');
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrors({ general: 'Google sign-in failed. Please try again.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <IoArrowBackOutline size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Create Account</h1>
            <p className="text-xs text-slate-400">Join SplitMate for free</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          {/* Avatar picker */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 hover:border-indigo-500 flex items-center justify-center overflow-hidden transition-all group"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <IoCameraOutline size={22} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[10px] text-slate-500 group-hover:text-indigo-400">Photo</span>
                </div>
              )}
              {photoPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <IoCameraOutline size={20} className="text-white" />
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
          </div>
          {errors.photo && <p className="text-xs text-rose-400 text-center -mt-2">{errors.photo}</p>}

          {/* Fields */}
          <Input
            label="Full Name"
            placeholder="Tannu Sharma"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => { const n = { ...p }; delete n.name; return n; }); }}
            prefix={<IoPersonOutline size={16} className="text-slate-500" />}
            error={errors.name}
            autoComplete="name"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
            prefix={<IoMailOutline size={16} className="text-slate-500" />}
            error={errors.email}
            autoComplete="email"
          />

          <div className="space-y-1.5">
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
              prefix={<IoLockClosedOutline size={16} className="text-slate-500" />}
              suffix={
                <button type="button" onClick={() => setShowPw((p) => !p)} className="text-slate-400 hover:text-white transition-colors">
                  {showPw ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                </button>
              }
              error={errors.password}
              autoComplete="new-password"
            />
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all',
                        i <= strength.score ? strength.color : 'bg-slate-700'
                      )}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className={cn('text-xs', strength.score <= 2 ? 'text-rose-400' : strength.score <= 3 ? 'text-amber-400' : 'text-emerald-400')}>
                    {strength.label}
                  </p>
                )}
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((p) => { const n = { ...p }; delete n.confirm; return n; }); }}
            prefix={
              confirm && confirm === password
                ? <IoCheckmarkCircle size={16} className="text-emerald-500" />
                : <IoLockClosedOutline size={16} className="text-slate-500" />
            }
            suffix={
              <button type="button" onClick={() => setShowConfirm((p) => !p)} className="text-slate-400 hover:text-white transition-colors">
                {showConfirm ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
              </button>
            }
            error={errors.confirm}
            autoComplete="new-password"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />

          {errors.general && (
            <p className="text-xs text-rose-400 bg-rose-900/20 px-3 py-2 rounded-xl">{errors.general}</p>
          )}

          <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
            Create Account
          </Button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full h-11 rounded-xl border border-slate-700 bg-white text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            {googleLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

