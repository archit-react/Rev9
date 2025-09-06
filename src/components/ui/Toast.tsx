import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  show: boolean;
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Toast({
  show,
  message,
  type = "success",
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timeout = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timeout);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`
            fixed bottom-6 right-6 z-50 flex items-center gap-3
            px-4 py-3 rounded-xl text-sm font-medium
            border border-elev bg-surface shadow-fresh-lg
            transition-colors
            ${
              type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          `}
        >
          {type === "success" ? <CheckCircle size={18} /> : <X size={18} />}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
