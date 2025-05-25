'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Github, Sparkles, Check, Code, Palette, Zap, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  
  useEffect(() => {
    // Check if popup was shown in this session
    const wasShown = sessionStorage.getItem('welcomePopupShown');
    const isHomePage = window.location.pathname === '/';
    
    if (!wasShown && isHomePage && !user) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('welcomePopupShown', 'true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  if (!isOpen) return null;

  // Features list with icons
  const features = [
    { icon: <Code className="w-5 h-5 text-blue-400" />, text: 'Exclusive content' },
    { icon: <Palette className="w-5 h-5 text-purple-400" />, text: 'Custom themes' },
    { icon: <Zap className="w-5 h-5 text-yellow-400" />, text: 'Early access' },
    { icon: <Heart className="w-5 h-5 text-pink-400" />, text: 'Support my work' },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            type: 'spring', 
            damping: 20, 
            stiffness: 300,
            delay: 0.1
          }}
          className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left side - Decorative */}
          <div className="hidden md:block w-1/3 bg-gradient-to-b from-blue-900/30 to-purple-900/30 p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full -ml-40 -mb-40"></div>
            </div>
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Welcome!</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Join our community</h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10">
                      {feature.icon}
                    </span>
                    {feature.text}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Right side - Form */}
          <div className="w-full md:w-2/3 p-8 md:p-10 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center md:text-left mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Welcome to My Portfolio</h2>
              <p className="text-gray-300">Sign in to unlock all features and personalize your experience.</p>
            </div>

            <div className="space-y-5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/10 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#0F9D58"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#F4B400"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#DB4437"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </motion.button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-gray-900 text-sm text-gray-400">or explore without signing in</span>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  Continue as guest
                </button>
                <p className="mt-4 text-xs text-gray-500">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="text-blue-400 hover:underline">Terms</a> and{' '}
                  <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
