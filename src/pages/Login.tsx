import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowBackOutline,
} from 'react-icons/io5';
import { signInWithPopup } from 'firebase/auth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { authApi, tokenStore } from '../services/api';
import { auth, googleProvider } from '../config/firebase';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) { setError('Enter your email address'); return; }
    if (!password) { setError('Enter your password'); return; }
    setError('');
    setLoading(true);
    try {
      const { user, accessToken } = await authApi.login(email.trim(), password);
      tokenStore.set(accessToken);
      login(user, accessToken);
      navigate('/dashboard');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
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
        setError('Google sign-in failed. Please try again.');
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
            <h1 className="text-xl font-bold text-white">Log In</h1>
            <p className="text-xs text-slate-400">Welcome back to SplitMate</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            prefix={<IoMailOutline size={16} className="text-slate-500" />}
            autoComplete="email"
          />

          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            prefix={<IoLockClosedOutline size={16} className="text-slate-500" />}
            suffix={
              <button type="button" onClick={() => setShowPw((p) => !p)} className="text-slate-400 hover:text-white transition-colors">
                {showPw ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
              </button>
            }
            autoComplete="current-password"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setRememberMe((p) => !p)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                  rememberMe ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                }`}
              >
                {rememberMe && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-slate-400">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-900/20 px-3 py-2 rounded-xl">{error}</p>
          )}

          <Button fullWidth size="lg" loading={loading} onClick={handleLogin}>
            Log In
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
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

