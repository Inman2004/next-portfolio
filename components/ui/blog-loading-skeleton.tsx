'use client';

import { motion } from 'framer-motion';

export function BlogLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10 overflow-hidden"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
            <div className="h-4 bg-white/5 rounded w-full"></div>
            <div className="h-4 bg-white/5 rounded w-5/6"></div>
            <div className="h-4 bg-white/5 rounded w-4/6"></div>
            <div className="pt-4 flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-20 bg-white/5 rounded-full"></div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
