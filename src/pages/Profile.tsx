import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoPersonOutline,
  IoMailOutline,
  IoNotificationsOutline,
  IoMoonOutline,
  IoLogOutOutline,
  IoCreateOutline,
  IoCheckmarkOutline,
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
  IoLockClosedOutline,
  IoLogoGoogle,
  IoTrashOutline,
  IoCameraOutline,
  IoLanguageOutline,
  IoCashOutline,
  IoInformationCircleOutline,
  IoStarOutline,
  IoStar,
  IoCheckmarkCircle,
  IoChatbubblesOutline,
  IoCopyOutline,
  IoMailOpenOutline,
  IoBugOutline,
  IoSparklesOutline,
} from 'react-icons/io5';
import Avatar from '../components/common/Avatar';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi, userApi, ratingApi, tokenStore } from '../services/api';
import { cn } from '../utils/helpers';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-1 mb-1">
      {children}
    </p>
  );
}

function SettingRow({
  icon, label, value, onClick, rightEl, danger,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  rightEl?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick && !rightEl}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
        onClick
          ? danger
            ? 'hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer'
            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'
          : 'cursor-default'
      )}
    >
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
        danger
          ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', danger ? 'text-rose-500' : 'text-slate-900 dark:text-white')}>
          {label}
        </p>
        {value && <p className="text-xs text-slate-400 truncate">{value}</p>}
      </div>
      {rightEl ?? (onClick && (
        <IoChevronForwardOutline size={15} className={cn('shrink-0', danger ? 'text-rose-300' : 'text-slate-300 dark:text-slate-600')} />
      ))}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn('w-11 h-6 rounded-full transition-colors relative shrink-0', checked ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700')}
    >
      <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 p-0.5"
        >
          {(hovered || value) >= star
            ? <IoStar size={34} color="#f59e0b" />
            : <IoStarOutline size={34} color="#cbd5e1" />
          }
        </button>
      ))}
    </div>
  );
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const SUPPORT_EMAIL = 'support@splitmate.app';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Edit profile
  const [editName, setEditName] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editLang, setEditLang] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Change password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(user?.emailNotifications ?? true);
  const [pushNotif, setPushNotif] = useState(user?.pushNotifications ?? true);

  // Rating
  const [starValue, setStarValue] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);
  const [ratingError, setRatingError] = useState('');

  // Support copy
  const [emailCopied, setEmailCopied] = useState(false);

  if (!user) return null;

  const isGoogleUser = user.provider === 'google';

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openEdit = () => {
    setEditName(user.name);
    setEditCurrency(user.currency ?? 'INR');
    setEditLang(user.language ?? 'en');
    setEditError('');
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      setEditError('Name must be at least 2 characters');
      return;
    }
    setEditSaving(true);
    try {
      const updated = await userApi.updateProfile({ name: editName.trim(), currency: editCurrency, language: editLang });
      updateUser(updated);
      setEditOpen(false);
    } catch (e: unknown) {
      setEditError((e as Error).message ?? 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  };

  const saveNotifications = async (field: 'emailNotifications' | 'pushNotifications', val: boolean) => {
    try {
      const updated = await userApi.updateProfile({ [field]: val });
      updateUser(updated);
    } catch { /* silent */ }
  };

  const toggleEmailNotif = () => {
    const next = !emailNotif;
    setEmailNotif(next);
    saveNotifications('emailNotifications', next);
  };

  const togglePushNotif = () => {
    const next = !pushNotif;
    setPushNotif(next);
    saveNotifications('pushNotifications', next);
  };

  const changePassword = async () => {
    if (!currentPw) { setPwError('Enter current password'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    setPwSaving(true);
    try {
      await authApi.changePassword(currentPw, newPw);
      setPwDone(true);
      setTimeout(() => { setPasswordOpen(false); setPwDone(false); setCurrentPw(''); setNewPw(''); }, 1500);
    } catch (e: unknown) {
      setPwError((e as Error).message ?? 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const updated = await userApi.uploadAvatar(file);
      updateUser(updated);
    } catch { /* silent */ }
  };

  const handleLogout = async () => {
    await logout();
    tokenStore.clear();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount();
      await logout();
      tokenStore.clear();
      navigate('/');
    } catch { /* silent */ }
  };

  const openRating = () => {
    setStarValue(0);
    setReviewText('');
    setRatingDone(false);
    setRatingError('');
    setRatingOpen(true);
  };

  const submitRating = async () => {
    if (!starValue) { setRatingError('Please select a star rating'); return; }
    setRatingSaving(true);
    setRatingError('');
    try {
      await ratingApi.submit(starValue, reviewText.trim() || undefined);
      setRatingDone(true);
    } catch (e: unknown) {
      setRatingError((e as Error).message ?? 'Failed to submit rating');
    } finally {
      setRatingSaving(false);
    }
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(SUPPORT_EMAIL).catch(() => {});
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto animate-fade-in pb-6">
      {/* â”€â”€â”€ Profile Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Card padding="lg">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <button onClick={() => fileRef.current?.click()} className="relative w-20 h-20 rounded-full overflow-hidden group">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{initials(user.name)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                <IoCameraOutline size={20} className="text-white" />
              </div>
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-indigo-600 transition-colors"
            >
              <IoCreateOutline size={11} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user.name}</h2>
                <p className="text-sm text-slate-400 truncate flex items-center gap-1">
                  <IoMailOutline size={12} /> {user.email}
                </p>
              </div>
              <button
                onClick={openEdit}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors shrink-0"
              >
                <IoCreateOutline size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={isGoogleUser ? 'info' : 'success'} size="sm" dot>
                {isGoogleUser ? 'Google Account' : 'Email Account'}
              </Badge>
              {user.currency && <Badge variant="default" size="sm">{user.currency}</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* â”€â”€â”€ Preferences â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-2">
        <SectionTitle>Preferences</SectionTitle>
        <Card padding="sm">
          <SettingRow icon={<IoMoonOutline size={16} />} label="Appearance" value={isDark ? 'Dark Mode' : 'Light Mode'} rightEl={<Toggle checked={isDark} onChange={toggleTheme} />} />
          <SettingRow icon={<IoMailOutline size={16} />} label="Email Notifications" value={emailNotif ? 'Enabled' : 'Disabled'} rightEl={<Toggle checked={emailNotif} onChange={toggleEmailNotif} />} />
          <SettingRow icon={<IoNotificationsOutline size={16} />} label="Push Notifications" value={pushNotif ? 'Enabled' : 'Disabled'} rightEl={<Toggle checked={pushNotif} onChange={togglePushNotif} />} />
          <SettingRow icon={<IoCashOutline size={16} />} label="Currency" value={user.currency ?? 'INR'} onClick={openEdit} />
          <SettingRow icon={<IoLanguageOutline size={16} />} label="Language" value={user.language === 'en' ? 'English' : (user.language ?? 'English')} onClick={openEdit} />
        </Card>
      </div>

      {/* â”€â”€â”€ Security â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-2">
        <SectionTitle>Security</SectionTitle>
        <Card padding="sm">
          {!isGoogleUser && (
            <SettingRow
              icon={<IoLockClosedOutline size={16} />}
              label="Change Password"
              value="Last updated recently"
              onClick={() => { setCurrentPw(''); setNewPw(''); setPwError(''); setPwDone(false); setPasswordOpen(true); }}
            />
          )}
          {isGoogleUser && (
            <SettingRow icon={<IoLogoGoogle size={16} />} label="Connected with Google" value={user.email} />
          )}
          <SettingRow icon={<IoShieldCheckmarkOutline size={16} />} label="Privacy Policy" value="How we handle your data" onClick={() => navigate('/privacy-policy')} />
        </Card>
      </div>

      {/* â”€â”€â”€ Feedback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-2">
        <SectionTitle>Feedback</SectionTitle>
        <Card padding="sm">
          <SettingRow icon={<IoStarOutline size={16} />} label="Rate SplitMate" value="Love using it? Leave a review" onClick={openRating} />
          <SettingRow icon={<IoChatbubblesOutline size={16} />} label="Contact Support" value="Get help from our team" onClick={() => setSupportOpen(true)} />
          <SettingRow icon={<IoInformationCircleOutline size={16} />} label="About" value="Version 1.0.0" onClick={() => setAboutOpen(true)} />
        </Card>
      </div>

      {/* â”€â”€â”€ Account â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-2">
        <SectionTitle>Account</SectionTitle>
        <Card padding="sm">
          <SettingRow icon={<IoLogOutOutline size={16} />} label="Log Out" onClick={() => setLogoutOpen(true)} danger />
          <SettingRow icon={<IoTrashOutline size={16} />} label="Delete Account" value="Permanently delete your data" onClick={() => setDeleteOpen(true)} danger />
        </Card>
      </div>

      {/* â”€â”€â”€ Edit Profile Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="sm">
        <div className="space-y-4">
          <Input label="Full Name" value={editName} onChange={(e) => { setEditName(e.target.value); setEditError(''); }} prefix={<IoPersonOutline size={15} className="text-slate-400" />} autoFocus />
          <Input label="Email" value={user.email} disabled prefix={<IoMailOutline size={15} className="text-slate-400" />} hint="Email cannot be changed" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Currency</label>
              <select value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="INR">INR (&#8377;)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (&euro;)</option>
                <option value="GBP">GBP (&pound;)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Language</label>
              <select value={editLang} onChange={(e) => setEditLang(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            </div>
          </div>
          {editError && <p className="text-xs text-rose-500">{editError}</p>}
          <Button fullWidth loading={editSaving} onClick={saveProfile} icon={<IoCheckmarkOutline size={15} />}>Save Changes</Button>
        </div>
      </Modal>

      {/* â”€â”€â”€ Change Password Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change Password" size="sm">
        <div className="space-y-4">
          {pwDone ? (
            <div className="text-center py-4">
              <IoCheckmarkOutline size={40} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Password changed!</p>
            </div>
          ) : (
            <>
              <Input label="Current Password" type="password" value={currentPw} onChange={(e) => { setCurrentPw(e.target.value); setPwError(''); }} prefix={<IoLockClosedOutline size={15} className="text-slate-400" />} autoFocus />
              <Input label="New Password" type="password" placeholder="Min 8 characters" value={newPw} onChange={(e) => { setNewPw(e.target.value); setPwError(''); }} prefix={<IoLockClosedOutline size={15} className="text-slate-400" />} onKeyDown={(e) => e.key === 'Enter' && changePassword()} />
              {pwError && <p className="text-xs text-rose-500">{pwError}</p>}
              <Button fullWidth loading={pwSaving} onClick={changePassword} icon={<IoCheckmarkOutline size={15} />}>Update Password</Button>
            </>
          )}
        </div>
      </Modal>

      {/* â”€â”€â”€ Rate SplitMate Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal open={ratingOpen} onClose={() => setRatingOpen(false)} title="Rate SplitMate" size="sm">
        <div className="space-y-5">
          {ratingDone ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-3">
                <IoCheckmarkCircle size={52} className="text-emerald-500" />
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Thank you!</p>
              <p className="text-sm text-slate-400 mt-1">Your feedback helps us improve SplitMate.</p>
              <Button fullWidth className="mt-5" onClick={() => setRatingOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">How would you rate SplitMate?</p>
                <StarRating value={starValue} onChange={setStarValue} />
                {starValue > 0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][starValue]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Write a review (optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What do you love? What could be better?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>
              {ratingError && <p className="text-xs text-rose-500">{ratingError}</p>}
              <Button fullWidth loading={ratingSaving} onClick={submitRating} icon={<IoStarOutline size={15} />}>
                Submit Rating
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* â”€â”€â”€ Contact Support Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal open={supportOpen} onClose={() => setSupportOpen(false)} title="Contact Support" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">We're here to help! Reach out through any of the options below.</p>

          {/* Email Support */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <IoMailOpenOutline size={16} className="text-indigo-500" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Email Support</p>
            </div>
            <p className="text-xs text-slate-400">For account issues, billing, or general help.</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5">
                {SUPPORT_EMAIL}
              </span>
              <button
                onClick={copyEmail}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  emailCopied
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200'
                )}
              >
                <IoCopyOutline size={13} />
                {emailCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Report Bug */}
          <button
            onClick={() => { setSupportOpen(false); window.open(`mailto:${SUPPORT_EMAIL}?subject=Bug Report - SplitMate`, '_blank'); }}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
              <IoBugOutline size={16} className="text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Report a Bug</p>
              <p className="text-xs text-slate-400">Found an issue? Let us know</p>
            </div>
            <IoChevronForwardOutline size={14} className="text-slate-300 ml-auto" />
          </button>

          {/* Feature Request */}
          <button
            onClick={() => { setSupportOpen(false); window.open(`mailto:${SUPPORT_EMAIL}?subject=Feature Request - SplitMate`, '_blank'); }}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <IoSparklesOutline size={16} className="text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Feature Request</p>
              <p className="text-xs text-slate-400">Suggest an idea for SplitMate</p>
            </div>
            <IoChevronForwardOutline size={14} className="text-slate-300 ml-auto" />
          </button>
        </div>
      </Modal>

      {/* â”€â”€â”€ About Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About SplitMate" size="sm">
        <div className="space-y-4 text-center">
          <img src="/favicon.png" alt="SplitMate" className="w-24 h-24 mx-auto object-contain mix-blend-multiply dark:mix-blend-screen" />
          <div>
            <h3 className="text-xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
              <span className="text-slate-900 dark:text-white">Split</span>
              <span className="bg-gradient-to-br from-[#7C5CFF] to-[#9B6DFF] bg-clip-text text-transparent">Mate</span>
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">Split expenses with roommates, fairly and instantly.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 text-left space-y-2">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Platform', value: 'Web Application' },
              { label: 'Built with', value: 'React Â· TypeScript Â· MongoDB' },
              { label: 'Contact', value: SUPPORT_EMAIL },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{label}</span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAboutOpen(false); navigate('/privacy-policy'); }} className="flex-1 text-sm text-indigo-500 hover:underline py-2">Privacy Policy</button>
            <span className="text-slate-200 dark:text-slate-700 self-center">|</span>
            <button onClick={() => { setAboutOpen(false); window.open(`mailto:${SUPPORT_EMAIL}`, '_blank'); }} className="flex-1 text-sm text-indigo-500 hover:underline py-2">Terms of Service</button>
          </div>
        </div>
      </Modal>

      {/* â”€â”€â”€ Logout Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Log Out" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to log out of SplitMate?</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleLogout} icon={<IoLogOutOutline size={14} />}>Log Out</Button>
          </div>
        </div>
      </Modal>

      {/* â”€â”€â”€ Delete Account Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This will permanently delete your account and all associated data. <strong className="text-rose-500">This cannot be undone.</strong>
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleDeleteAccount} icon={<IoTrashOutline size={14} />}>Delete Account</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

