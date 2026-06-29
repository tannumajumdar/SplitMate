import { useState, useEffect } from 'react';
import {
  IoAddOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoHomeOutline,
  IoCallOutline,
  IoMailOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
} from 'react-icons/io5';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ToastContainer from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { roomApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import type { RoomData, RoomMemberData } from '../types';
import { cn } from '../utils/helpers';

// Deterministic color from a name string
function nameToColor(name: string): string {
  const colors = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// â”€â”€â”€ Member row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MemberRow({
  member,
  isFirst,
  onEdit,
  onDelete,
}: {
  member: RoomMemberData;
  isFirst: boolean;
  onEdit: (m: RoomMemberData) => void;
  onDelete: (m: RoomMemberData) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 group transition-colors">
      <Avatar name={member.name} color={nameToColor(member.name)} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {member.name}
          {isFirst && <span className="ml-2 text-xs text-slate-400">(you)</span>}
        </p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
          <IoCallOutline size={10} /> {member.phone}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(member)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <IoCreateOutline size={15} />
        </button>
        {!isFirst && (
          <button
            onClick={() => onDelete(member)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <IoTrashOutline size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Room card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RoomCard({
  room,
  isActive,
  memberCount,
  onSelect,
  onDelete,
}: {
  room: RoomData;
  isActive: boolean;
  memberCount: number;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      hover
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-all',
        isActive && 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-950'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
          <IoHomeOutline size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{room.name}</p>
            {isActive && <Badge variant="success" size="sm" dot>Active</Badge>}
          </div>
          {room.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{room.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
        </div>
        <IoChevronForwardOutline size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
      </div>

      <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {copied ? <IoCheckmarkOutline size={11} className="text-emerald-500" /> : <IoCopyOutline size={11} />}
          <span className="font-mono tracking-wider">{room.inviteCode}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-xs text-slate-300 hover:text-rose-500 transition-colors"
        >
          <IoTrashOutline size={13} />
        </button>
      </div>
    </Card>
  );
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Room() {
  const { user } = useAuth();
  const {
    apiRooms, apiRoomsLoading, loadRooms, setApiRooms,
    activeRoomId, setActiveRoomId,
    activeRoomMembers, membersLoading, reloadMembers, setActiveRoomMembers,
  } = useApp();

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [deleteRoomOpen, setDeleteRoomOpen] = useState(false);
  const [deleteMemberOpen, setDeleteMemberOpen] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Form state
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [editingMember, setEditingMember] = useState<RoomMemberData | null>(null);
  const [deletingMember, setDeletingMember] = useState<RoomMemberData | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Member counts per room (fetched separately to avoid N+1 on load)
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (apiRooms.length === 0) return;
    // For member counts, use activeRoomMembers for the active room and estimate for others
    setMemberCounts((prev) => {
      const next = { ...prev };
      if (activeRoomId) next[activeRoomId] = activeRoomMembers.length;
      return next;
    });
  }, [activeRoomMembers, activeRoomId, apiRooms]);

  if (!user) return null;

  const activeRoom = apiRooms.find((r) => r.id === activeRoomId);

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreateRoom = async () => {
    if (!roomName.trim()) { setError('Enter a room name'); return; }
    setError(''); setLoading(true);
    try {
      const room = await roomApi.create(roomName.trim(), roomDesc.trim() || undefined);
      setApiRooms((p) => [room, ...p]);
      setActiveRoomId(room.id);
      setCreateOpen(false);
      setRoomName(''); setRoomDesc('');
      await reloadMembers();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberName.trim()) { setError('Name is required'); return; }
    if (!memberEmail.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail.trim())) { setError('Enter a valid email address'); return; }
    if (activeRoomMembers.some((m) => m.email?.toLowerCase() === memberEmail.trim().toLowerCase())) {
      setError('A member with this email already exists in this room'); return;
    }
    if (memberPhone && !/^\d{10}$/.test(memberPhone)) { setError('Enter a valid 10-digit mobile number'); return; }
    if (!activeRoomId) { setError('Select a room first'); return; }
    setError(''); setLoading(true);
    try {
      const newMember = await roomApi.addMember(activeRoomId, memberName.trim(), memberEmail.trim(), memberPhone.trim() || undefined);
      setActiveRoomMembers((p) => [...p, newMember]);
      setAddMemberOpen(false);
      setMemberName(''); setMemberEmail(''); setMemberPhone('');
      addToast('Member added successfully.', 'success');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = async () => {
    if (!editingMember || !activeRoomId) return;
    if (!memberName.trim()) { setError('Enter member name'); return; }
    if (!/^\d{10}$/.test(memberPhone)) { setError('Enter a valid 10-digit mobile number'); return; }
    setError(''); setLoading(true);
    try {
      const updated = await roomApi.updateMember(activeRoomId, editingMember.id, {
        name: memberName.trim(),
        phone: memberPhone.trim(),
      });
      setActiveRoomMembers((p) => p.map((m) => (m.id === updated.id ? updated : m)));
      setEditMemberOpen(false);
      setEditingMember(null);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember || !activeRoomId) return;
    setLoading(true);
    try {
      await roomApi.deleteMember(activeRoomId, deletingMember.id);
      setActiveRoomMembers((p) => p.filter((m) => m.id !== deletingMember.id));
      setDeleteMemberOpen(false);
      setDeletingMember(null);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to delete member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return;
    setLoading(true);
    try {
      await roomApi.deleteRoom(deletingRoom.id);
      setApiRooms((p) => p.filter((r) => r.id !== deletingRoom.id));
      if (activeRoomId === deletingRoom.id) {
        const remaining = apiRooms.filter((r) => r.id !== deletingRoom.id);
        setActiveRoomId(remaining[0]?.id ?? '');
      }
      setDeleteRoomOpen(false);
      setDeletingRoom(null);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const openEditMember = (m: RoomMemberData) => {
    setEditingMember(m);
    setMemberName(m.name);
    setMemberEmail(m.email ?? '');
    setMemberPhone(m.phone);
    setError('');
    setEditMemberOpen(true);
  };

  const openDeleteMember = (m: RoomMemberData) => {
    setDeletingMember(m);
    setDeleteMemberOpen(true);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto animate-fade-in">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Rooms</h2>
          <p className="text-sm text-slate-400">
            {apiRoomsLoading ? 'Loading...' : `${apiRooms.length} room${apiRooms.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            icon={<IoRefreshOutline size={14} />}
            onClick={loadRooms}
            loading={apiRoomsLoading}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            icon={<IoAddOutline size={14} />}
            onClick={() => { setRoomName(''); setRoomDesc(''); setError(''); setCreateOpen(true); }}
          >
            Create Room
          </Button>
        </div>
      </div>

      {/* Room list */}
      {apiRoomsLoading && apiRooms.length === 0 ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : apiRooms.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-3"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No rooms yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Create a room to start tracking expenses with your roommates</p>
          <Button size="sm" onClick={() => setCreateOpen(true)} icon={<IoAddOutline size={14} />}>
            Create Your First Room
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isActive={room.id === activeRoomId}
              memberCount={room.id === activeRoomId ? activeRoomMembers.length : (memberCounts[room.id] ?? 0)}
              onSelect={() => setActiveRoomId(room.id)}
              onDelete={() => { setDeletingRoom(room); setDeleteRoomOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Active room â€” member management */}
      {activeRoom && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IoPeopleOutline size={16} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Members  {activeRoom.name}
              </p>
              <Badge variant="default" size="sm">{activeRoomMembers.length}</Badge>
            </div>
            <Button
              size="xs"
              icon={<IoPersonAddOutline size={12} />}
              onClick={() => { setMemberName(''); setMemberEmail(''); setMemberPhone(''); setError(''); setAddMemberOpen(true); }}
            >
              Add Member
            </Button>
          </div>

          {membersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : activeRoomMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No members found</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Add your roommates to start splitting expenses</p>
              <Button
                size="sm"
                icon={<IoPersonAddOutline size={14} />}
                onClick={() => { setMemberName(''); setMemberEmail(''); setMemberPhone(''); setError(''); setAddMemberOpen(true); }}
              >
                Add Member
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {activeRoomMembers.map((member, idx) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isFirst={idx === 0}
                  onEdit={openEditMember}
                  onDelete={openDeleteMember}
                />
              ))}
            </div>
          )}

          {/* Room stats */}
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{activeRoomMembers.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Members</p>
            </div>
            <div
              className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              onClick={() => navigator.clipboard.writeText(activeRoom.inviteCode)}
            >
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-wider">
                {activeRoom.inviteCode}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Invite Code (tap to copy)</p>
            </div>
          </div>
        </Card>
      )}

      {/* â”€â”€â”€ Create Room Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setError(''); }}
        title="Create a New Room"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Room Name"
            placeholder="e.g. Flat 302, 3BHK Bandra"
            value={roomName}
            onChange={(e) => { setRoomName(e.target.value); setError(''); }}
            error={error}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
            autoFocus
          />
          <Input
            label="Description (optional)"
            placeholder="e.g. 4th floor, near metro"
            value={roomDesc}
            onChange={(e) => setRoomDesc(e.target.value)}
          />
          <p className="text-xs text-slate-400 -mt-2">
            You'll be added as the first member automatically.
          </p>
          <Button fullWidth loading={loading} onClick={handleCreateRoom} icon={<IoHomeOutline size={16} />}>
            Create Room
          </Button>
        </div>
      </Modal>

      {/* â”€â”€â”€ Add Member Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        open={addMemberOpen}
        onClose={() => { setAddMemberOpen(false); setMemberName(''); setMemberEmail(''); setMemberPhone(''); setError(''); }}
        title="Add Member"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={memberName}
            onChange={(e) => { setMemberName(e.target.value); setError(''); }}
            autoFocus
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="rahul@example.com"
            value={memberEmail}
            onChange={(e) => { setMemberEmail(e.target.value); setError(''); }}
            prefix={<IoMailOutline size={15} className="text-slate-400" />}
          />
          <Input
            label="Mobile Number (Optional)"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            value={memberPhone}
            onChange={(e) => { setMemberPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
            prefix={<span className="text-slate-400 text-sm pr-1 border-r border-slate-200 dark:border-slate-600 mr-1">+91</span>}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
          />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={handleAddMember} icon={<IoPersonAddOutline size={16} />}>
            Add Member
          </Button>
        </div>
      </Modal>

      {/* â”€â”€â”€ Edit Member Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        open={editMemberOpen}
        onClose={() => { setEditMemberOpen(false); setEditingMember(null); setError(''); }}
        title="Edit Member"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={memberName}
            onChange={(e) => { setMemberName(e.target.value); setError(''); }}
            autoFocus
          />
          <Input
            label="Mobile Number"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={memberPhone}
            onChange={(e) => { setMemberPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
            prefix={<span className="text-slate-400 text-sm pr-1 border-r border-slate-200 dark:border-slate-600 mr-1">+91</span>}
            onKeyDown={(e) => e.key === 'Enter' && handleEditMember()}
          />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={handleEditMember} icon={<IoCheckmarkOutline size={16} />}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* â”€â”€â”€ Delete Member Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        open={deleteMemberOpen}
        onClose={() => { setDeleteMemberOpen(false); setDeletingMember(null); }}
        title="Remove Member"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Remove <strong className="text-slate-900 dark:text-white">{deletingMember?.name}</strong> from this room?
            Their expenses won't be deleted.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteMemberOpen(false)}>Cancel</Button>
            <Button variant="danger" fullWidth loading={loading} onClick={handleDeleteMember} icon={<IoTrashOutline size={14} />}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      {/* â”€â”€â”€ Delete Room Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        open={deleteRoomOpen}
        onClose={() => { setDeleteRoomOpen(false); setDeletingRoom(null); }}
        title="Delete Room"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Delete <strong className="text-slate-900 dark:text-white">{deletingRoom?.name}</strong>?
            All members will be removed. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteRoomOpen(false)}>Cancel</Button>
            <Button variant="danger" fullWidth loading={loading} onClick={handleDeleteRoom} icon={<IoTrashOutline size={14} />}>
              Delete Room
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

