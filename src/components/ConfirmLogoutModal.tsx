// src/components/ConfirmLogoutModal.tsx
import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmLogoutModal({
  open,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className="relative z-50 w-[92%] max-w-sm rounded-2xl 
                   bg-white/10 dark:bg-[#0b0b0b]/30 
                   backdrop-blur-xl 
                   border border-white/10 dark:border-white/5 
                   shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                   p-5"
      >
        <h2 className="text-base font-semibold text-white mb-1">Sign out?</h2>
        <p className="text-sm text-gray-300 mb-5">
          You’ll need to log in again to access the dashboard.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 h-10 rounded-full border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="px-4 h-10 rounded-full bg-red-600/90 text-white text-sm hover:bg-red-500/90 active:bg-red-700/90 transition"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}
