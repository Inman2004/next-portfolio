'use client';

import { useState } from 'react';
import { motion as m } from 'framer-motion';
import { X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-lg p-6 shadow-2xl border border-zinc-700/50 max-w-md w-full"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mb-6 text-zinc-400 dark:text-zinc-600">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-600 text-white rounded-lg hover:bg-zinc-600 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </m.div>
    </m.div>
  );
}
