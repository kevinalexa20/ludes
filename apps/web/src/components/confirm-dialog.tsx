import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-brand-neutral-100 z-10 text-center flex flex-col items-center gap-4"
          >
            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <AlertTriangle size={24} />
            </div>

            <h3 className="font-display text-lg font-bold text-brand-neutral-950">
              {title}
            </h3>
            
            <p className="text-sm text-brand-neutral-600">
              {message}
            </p>

            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-brand-neutral-100 hover:bg-brand-neutral-200 text-brand-neutral-800 font-semibold rounded-xl py-3 cursor-pointer transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 font-semibold rounded-xl py-3 cursor-pointer text-white transition-colors ${
                  isDestructive
                    ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                    : "bg-brand-green-500 hover:bg-brand-green-600 active:bg-brand-green-700"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
