import type { IconType } from 'react-icons';
import { IoCheckmarkCircle, IoAlertCircle, IoWarning, IoInformationCircle, IoClose } from 'react-icons/io5';
import type { Toast as ToastType } from '../../hooks/useToast';
import { cn } from '../../utils/helpers';

interface ToastItemProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

interface ToastConfig {
  IconComp: IconType;
  container: string;
  iconClass: string;
  text: string;
}

const config: Record<string, ToastConfig> = {
  success: {
    IconComp: IoCheckmarkCircle,
    container: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700',
    iconClass: 'text-emerald-500',
    text: 'text-emerald-800 dark:text-emerald-300',
  },
  error: {
    IconComp: IoAlertCircle,
    container: 'bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-700',
    iconClass: 'text-rose-500',
    text: 'text-rose-800 dark:text-rose-300',
  },
  warning: {
    IconComp: IoWarning,
    container: 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700',
    iconClass: 'text-amber-500',
    text: 'text-amber-800 dark:text-amber-300',
  },
  info: {
    IconComp: IoInformationCircle,
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700',
    iconClass: 'text-blue-500',
    text: 'text-blue-800 dark:text-blue-300',
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const cfg = config[toast.type];
  const { IconComp } = cfg;

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg animate-slide-down',
        cfg.container
      )}
    >
      <IconComp size={20} className={cn('shrink-0 mt-0.5', cfg.iconClass)} />
      <p className={cn('text-sm font-medium flex-1', cfg.text)}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={cn('shrink-0 opacity-60 hover:opacity-100 transition-opacity', cfg.text)}
      >
        <IoClose size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
