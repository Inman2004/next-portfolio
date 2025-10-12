'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  inView?: boolean;
}

export function BlurFade({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  inView = true,
}: BlurFadeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (prefersReducedMotion || !isMounted || !inView) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0)' }}
      transition={{
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
