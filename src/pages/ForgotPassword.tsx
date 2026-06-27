import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoMailOutline, IoArrowBackOutline, IoCheckmarkCircle } from 'react-icons/io5';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { authApi } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch {
      setSent(true); // always show success (security best practice)
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto">
            <IoCheckmarkCircle size={44} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Check your email</h2>
            <p className="text-sm text-slate-400 mt-2">
              If <span className="text-indigo-400 font-medium">{email}</span> has a SplitMate account, we've sent a password reset link. Check your inbox (and spam).
            </p>
          </div>
          <p className="text-xs text-slate-500">The link expires in 1 hour.</p>
          <div className="space-y-2">
            <Button fullWidth onClick={() => { setSent(false); setEmail(''); }}>
              Send Again
            </Button>
            <button
              onClick={() => navigate('/login')}
              className="w-full text-sm text-indigo-400 hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/login')}
            className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <IoArrowBackOutline size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Forgot Password</h1>
            <p className="text-xs text-slate-400">We'll send you a reset link</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <p className="text-sm text-slate-400">
            Enter the email address associated with your account and we'll send you a password reset link.
          </p>

          <Input
            label="Email Address"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            prefix={<IoMailOutline size={16} className="text-slate-500" />}
            error={error}
            autoComplete="email"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            autoFocus
          />

          <Button fullWidth size="lg" loading={loading} onClick={handleSend}>
            Send Reset Link
          </Button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-4">
          Remember your password?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
