'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './loading-spinner';

interface PageLoadingProps {
  isLoading: boolean;
}

export function PageLoading({ isLoading }: PageLoadingProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size={48} className="text-white" />
            <motion.p 
              className="text-white/80 text-lg font-medium"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Loading...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
