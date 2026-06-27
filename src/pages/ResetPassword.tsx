import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { authApi } from '../services/api';
import { cn } from '../utils/helpers';

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);

  const handleReset = async () => {
    const e: Record<string, string> = {};
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    if (!token) e.general = 'Reset token is missing. Please use the link from your email.';
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword(token, password, confirm);
      setDone(true);
    } catch (err: unknown) {
      setErrors({ general: (err as Error).message ?? 'Reset failed. The link may have expired.' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-rose-400 font-medium">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-indigo-400 hover:underline text-sm">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto">
            <IoCheckmarkCircle size={44} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Password Reset!</h2>
            <p className="text-sm text-slate-400 mt-2">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
          </div>
          <Button fullWidth onClick={() => navigate('/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src="/favicon.png" alt="SplitMate" className="w-20 h-20 object-contain mx-auto mb-4 mix-blend-screen" />
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400 mt-1">Enter your new password below</p>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="space-y-1.5">
            <Input
              label="New Password"
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
              autoFocus
            />
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i <= strength.score ? strength.color : 'bg-slate-700')} />
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
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat new password"
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
            onKeyDown={(e) => e.key === 'Enter' && handleReset()}
          />

          {errors.general && (
            <p className="text-xs text-rose-400 bg-rose-900/20 px-3 py-2 rounded-xl">{errors.general}</p>
          )}

          <Button fullWidth size="lg" loading={loading} onClick={handleReset}>
            Reset Password
          </Button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-4">
          <Link to="/login" className="text-indigo-400 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
