import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onDismiss, duration = 4000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        onDismiss();
      }, duration);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [visible, duration, onDismiss]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
        {message}
        <button
          type="button"
          onClick={() => { setShow(false); onDismiss(); }}
          className="ml-2 text-white/50 hover:text-white transition-colors text-xs"
          aria-label="Dismiss"
        >
          x
        </button>
      </div>
    </div>
  );
}
