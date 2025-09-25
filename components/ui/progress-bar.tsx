'use client';

import { useTheme } from 'next-themes';
import { motion, AnimatePresence, m } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ProgressBarProps {
  isLoading: boolean;
}

export function ProgressBar({ isLoading }: ProgressBarProps) {
  const { resolvedTheme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [indeterminate, setIndeterminate] = useState(true);

  // Generate gradient based on theme
  const getGradient = () => {
    if (resolvedTheme === 'dark') {
      return 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981, #06b6d4, #6366f1)'; // Indigo to cyan to teal to purple to indigo
    }
    return 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #8b5cf6, #3b82f6)'; // Blue to purple to pink to purple to blue
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let animationFrame: number | null = null;

    if (isLoading) {
      // Reset progress when loading starts
      setProgress(0);
      
      // Quick initial progress to 20%
      timer = setTimeout(() => {
        setProgress(20);
        
        // Progress to 50%
        timer = setTimeout(() => {
          setProgress(50);
          
          // Progress to 80%
          timer = setTimeout(() => {
            setProgress(80);
            setIndeterminate(true);
          }, 500);
        }, 300);
      }, 100);
    } else {
      // When loading completes, quickly finish the progress bar
      setIndeterminate(false);
      setProgress(100);
      
      // Reset after animation completes
      timer = setTimeout(() => {
        setProgress(0);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {(isLoading || progress > 0) && (
        <m.div
          className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <m.div
            className="h-full"
            style={{
              background: getGradient(),
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.7)',
              transition: indeterminate ? 'width 0.4s ease' : 'width 0.2s ease-out',
              backgroundSize: '200% 100%',
            }}
            animate={indeterminate && isLoading ? {
              backgroundPosition: ['0% 0%', '100% 0%'],
            } : {}}
            transition={indeterminate && isLoading ? {
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              repeatType: 'reverse',
            } : {}}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}
