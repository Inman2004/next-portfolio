'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Github } from 'lucide-react';
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700/50 overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Hey there! Just sign in one click</h2>
              <p className="text-gray-300">Sign in to unlock all features and personalize your experience.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                Continue with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900 text-gray-400">or</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="text-blue-400 hover:underline">Terms</a> and{' '}
                  <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
