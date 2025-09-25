'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  message,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <m.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-800/90 backdrop-blur-sm rounded-lg p-6 max-w-md w-full border border-zinc-700/50"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Confirm Action</h3>
          <p className="text-zinc-300 mb-6">{message}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}
