import { getInitials } from '../../utils/helpers';
import { cn } from '../../utils/helpers';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  className?: string;
  ring?: boolean;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export default function Avatar({
  name,
  color = '#6366f1',
  size = 'md',
  src,
  className,
  ring = false,
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white select-none shrink-0',
        sizeMap[size],
        ring && 'ring-2 ring-white dark:ring-slate-800 ring-offset-1',
        className
      )}
      style={{ backgroundColor: src ? undefined : color }}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

interface AvatarGroupProps {
  users: { name: string; color?: string }[];
  max?: number;
  size?: AvatarProps['size'];
}

export function AvatarGroup({ users, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const extra = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={i} name={u.name} color={u.color} size={size} ring />
      ))}
      {extra > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white bg-slate-400 dark:bg-slate-600 ring-2 ring-white dark:ring-slate-800 ring-offset-1 shrink-0',
            sizeMap[size]
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
