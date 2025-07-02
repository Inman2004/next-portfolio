'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Image from 'next/image';

// Dynamically import the 3D component
const InteractiveCard3D = dynamic(() => import('./HeroID'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
      <div className="animate-pulse text-blue-400">Loading 3D Avatar...</div>
    </div>
  )
});

// This is an alternative component that's not currently used
const AvatarSection = () => {
  return (
    <div className="relative w-full h-full">
      <motion.div 
        className="relative w-full h-full overflow-hidden border-2 border-blue-300/40 dark:border-blue-500/30 shadow-[0_0_25px_-10px_rgba(99,102,241,0.2)] dark:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] bg-black/80 dark:bg-black/60 backdrop-blur-sm"
        initial={{
          borderRadius: '50%'
        }}
        whileHover={{
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          scale: 1.02,
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 0.8, 
          ease: 'easeInOut',
          borderRadius: { 
            duration: 1.5, 
            ease: 'easeInOut', 
            repeat: Infinity, 
            repeatType: 'reverse' as const,
          },
          rotate: { 
            duration: 8, 
            ease: 'easeInOut', 
            repeat: Infinity, 
            repeatType: 'reverse' as const,
          }
        }}
      >
      {/* 3D Card Component with parallax effect */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        whileHover={{ 
          scale: 1.05,
        }}
        transition={{ 
          duration: 0.6, 
          ease: 'easeInOut',
        }}
      >
        <Suspense fallback={
          <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
            {/* Fallback to original image while 3D loads */}
            <Image
              src="/images/avatar1.png"
              alt="Immanuvel"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover w-full h-full transition-all duration-1000 ease-out opacity-50"
              priority
              quality={90}
            />
          </div>
        }>
          <InteractiveCard3D />
        </Suspense>
      </motion.div>

      {/* Optional overlay for better integration */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-purple-600/20 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Optional floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  </div>
  );
};

const AvatarCard3D = () => {
  return (
    <div className="relative w-full h-full">
      <motion.div 
        className="relative w-full h-full overflow-hidden border-2 border-blue-300/40 dark:border-blue-500/30 shadow-[0_0_25px_-10px_rgba(99,102,241,0.2)] dark:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] bg-black/80 backdrop-blur-sm rounded-3xl"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 0 50px -10px rgba(99,102,241,0.6)",
        }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center rounded-3xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <p className="text-blue-400 text-sm">Loading Interactive Avatar...</p>
            </div>
          </div>
        }>
          <InteractiveCard3D />
        </Suspense>
      </motion.div>
    </div>
  );
};

export default AvatarCard3D;