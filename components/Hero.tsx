"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MorphingText } from "@/components/magicui/morphing-text";
import { AuroraText } from "@/components/magicui/aurora-text";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Quote } from "lucide-react";

interface QuoteType {
  quote: string;
  author: string;
}

export default function Hero() {
  const [localQuotes, setLocalQuotes] = useState<QuoteType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<QuoteType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const quoteRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  const fetchQuotes = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (hasFetchedRef.current) return;
    
    try {
      hasFetchedRef.current = true;
      const response = await fetch('/api/quotes');
      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      
      setLocalQuotes(prevQuotes => {
        // Only update if quotes have changed
        if (JSON.stringify(prevQuotes) === JSON.stringify(data)) {
          return prevQuotes;
        }
        return data;
      });
      
      // Set initial quote if not set or if quotes changed
      if (data.length > 0 && (!quote || !localQuotes.some(q => q.quote === quote.quote && q.author === quote.author))) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setQuote(data[randomIndex]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load quotes:", error);
      // Fallback to local quotes in case of error
      const fallbackQuotes = [
        {
          quote: "The only way to do great work is to love what you do.",
          author: "Steve Jobs"
        },
        {
          quote: "Innovation distinguishes between a leader and a follower.",
          author: "Steve Jobs"
        }
      ];
      
      setLocalQuotes(prevQuotes => 
        prevQuotes.length > 0 ? prevQuotes : fallbackQuotes
      );
      
      if (!quote && fallbackQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
        setQuote(fallbackQuotes[randomIndex]);
      }
      
      setIsLoading(false);
    } finally {
      hasFetchedRef.current = false;
    }
  }, [quote, localQuotes]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Function to get a new random quote
  const getNewQuote = useCallback(() => {
    if (localQuotes.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    
    // Wait for the fade-out animation to complete
    const timer = setTimeout(() => {
      const currentIndex = localQuotes.findIndex(q => 
        q.quote === quote?.quote && q.author === quote?.author
      );
      
      let newIndex;
      // Ensure we get a different quote if there are multiple quotes
      if (localQuotes.length > 1) {
        do {
          newIndex = Math.floor(Math.random() * localQuotes.length);
        } while (newIndex === currentIndex);
      } else {
        newIndex = 0;
      }
      
      setQuote(localQuotes[newIndex]);
      // Small delay before allowing next animation
      setTimeout(() => setIsAnimating(false), 100);
    }, 500); // Match this with your CSS transition time
    
    return () => clearTimeout(timer);
  }, [localQuotes, quote?.quote, quote?.author, isAnimating]);

  // Removed the interval for quote rotation to show only one quote per session
  
  // Set initial quote when localQuotes is loaded
  useEffect(() => {
    if (localQuotes.length > 0 && !quote) {
      const randomIndex = Math.floor(Math.random() * localQuotes.length);
      setQuote(localQuotes[randomIndex]);
      setIsLoading(false);
    }
  }, [localQuotes, quote]);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative w-full mb-24 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-pattern" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-500/5 to-purple-500/10" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 pt-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block"
            >
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/30 dark:border-blue-200/10 text-blue-700 dark:text-blue-300 mb-6 inline-block backdrop-blur-sm">
                Welcome to my portfolio
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Hi, I&apos;m <AuroraText>Immanuvel</AuroraText>
              </span>
            </h1>

            <div className="text-lg sm:text-xl md:text-2xl text-indigo-700 dark:text-indigo-300 mb-8 h-[180px] flex items-center justify-center lg:justify-start">
              <MorphingText
                texts={[
                  "UI/UX Designer",
                  "Full Stack Developer",
                  "Graphic Designer",
                  "3D Artist",
                ]}
                className="text-center lg:text-left !h-[160px] text-indigo-800/90 dark:text-indigo-300"
              />
            </div>
            <div className="mb-2">
              <p className="text-sm text-blue-600/80 dark:text-blue-300/80 mb-1 ml-2 font-livvic" style={{ fontFamily: 'var(--font-livvic)' }}>
                a quote for you
              </p>
              <div className="w-full max-w-3xl mx-auto space-y-3" ref={quoteRef}>
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={quote?.quote || 'loading'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex items-start gap-3"
                    >
                      <Quote className="text-pink-400/80 flex-shrink-0 mt-1" size={24} />
                      <p className="px-5 py-3 text-lg lg:text-xl leading-relaxed font-medium tracking-normal rounded-xl text-transparent bg-clip-text bg-gradient-to-tr to-purple-600/90 from-teal-500/90 dark:to-purple-500/80 dark:from-teal-400/80 w-full whitespace-normal break-words" 
                        style={{ 
                          fontFamily: 'var(--font-pacifico), cursive', 
                          filter: 'contrast(0.9) brightness(1.1)',
                          wordSpacing: '0.1em',
                          letterSpacing: '0.01em'
                        }}>
                        {isLoading ? (
                          <span className="inline-block h-7 w-full animate-pulse bg-purple-700/20 rounded">wait let me pick a quote for you...</span>
                        ) : quote?.quote || "The only way to learn a new programming language is by writing programs in it."}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="pr-3">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={`author-${quote?.author || 'loading'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="text-right text-pink-600/80 dark:text-pink-300/60 text-sm lg:text-base" 
                      style={{ 
                        fontFamily: 'var(--font-pacifico), cursive', 
                        fontWeight: 500, 
                        filter: 'contrast(0.9) brightness(1.1)' 
                      }}
                    >
                      - {isLoading ? (
                        <span className="inline-block h-4 w-24 bg-purple-700/20 rounded animate-pulse"></span>
                      ) : quote?.author || "Dennis Ritchie"}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-lg font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-blue-500/25 text-white text-center"
              >
                View My Work
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-blue-500/30 dark:border-blue-500/30 rounded-lg text-lg font-medium hover:bg-blue-500/10 dark:hover:bg-blue-500/10 transition-all duration-300 text-center text-blue-700 dark:text-blue-200 hover:text-blue-800 dark:hover:text-white"
              >
                Get in Touch
              </motion.a>
            </div>

            {/* Social Links */}
            <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start">
              <motion.a
                href="https://github.com/Inman2004"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#6d28d9] dark:text-[#a930d5] hover:opacity-80 transition-opacity"
              >
                <FaGithub className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/rv3d"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#0a5cb4] dark:text-[#0A66C2] hover:opacity-80 transition-opacity"
              >
                <FaLinkedin className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://twitter.com/rvimman_"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-gray-800 dark:text-[#fff] hover:opacity-80 transition-opacity"
              >
                <FaXTwitter className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="mailto:rvimman@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#d93025] dark:text-[#cf594e] hover:opacity-80 transition-opacity"
              >
                <SiGmail className="w-6 h-6" />
              </motion.a>
            </div>
          </motion.div>

          {/* Right Content - 3D or Image Element */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col items-center text-center space-y-6 mt-4"
          >
            <motion.div 
              className="relative w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative w-full aspect-square group">
                {/* Glow effect with animation */}
                <motion.div 
                  className="absolute inset-0 rounded-full -z-10"
                  initial={{
                    opacity: 0.3,
                    scale: 0.9,
                    background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15), transparent 60%)',
                  }}
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [0.9, 1.05, 0.9],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    filter: 'blur(30px)',
                    transform: 'translateZ(0)',
                  }}
                />
                
                {/* Main image container with shape morphing */}
                <motion.div 
                  className="relative w-full h-full overflow-hidden border-2 border-blue-300/40 dark:border-blue-500/30 
                    shadow-[0_0_25px_-10px_rgba(99,102,241,0.2)] dark:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]
                    bg-white/20 dark:bg-transparent backdrop-blur-sm"
                  initial={{ borderRadius: '50%' }}
                  whileHover={{
                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                    scale: 1.02,
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeInOut',
                    borderRadius: {
                      duration: 1.5,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'reverse',
                    },
                    rotate: {
                      duration: 8,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }
                  }}
                >
                  {/* Image with parallax effect */}
                  <motion.div 
                    className="absolute inset-0 w-full h-full"
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 8,
                      ease: 'easeInOut',
                      rotate: {
                        duration: 12,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }
                    }}
                  >
                    <Image
                      src="/images/avatar1.png"
                      alt="Immanuvel"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-all duration-1000 ease-out"
                      priority
                      quality={90}
                      loading="eager"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    />
                  </motion.div>
                  
                  {/* Overlay gradients */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/10 to-transparent"
                    whileHover={{ opacity: 0.7 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-blue-100/40 
                      dark:from-blue-950/90 dark:via-transparent dark:to-blue-900/80"
                    whileHover={{ opacity: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-transparent to-purple-100/20 
                      dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20"
                    whileHover={{ opacity: 0.6 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  
                  {/* Animated border effect */}
                  <motion.div 
                    className="absolute inset-0 border-2 border-transparent"
                    animate={{
                      borderRadius: ['50%', '30% 70% 70% 30% / 30% 30% 70% 70%'],
                      borderColor: ['rgba(99,102,241,0)', 'rgba(99,102,241,0.5)'],
                      boxShadow: ['0 0 0 0 rgba(99,102,241,0.1)', '0 0 30px 5px rgba(99,102,241,0.2)'],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
                
                {/* Floating elements with staggered animations */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute rounded-full ${
                      i % 2 === 0 
                        ? 'bg-blue-400/80 dark:bg-blue-300' 
                        : 'bg-purple-300/80 dark:bg-purple-300'
                    }`}
                    style={{
                      width: `${8 + i * 4}px`,
                      height: `${8 + i * 4}px`,
                      top: `${10 + i * 15}%`,
                      left: i % 2 === 0 ? '10%' : '80%',
                      opacity: 0,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 0.7, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 4 + i,
                      delay: i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
            
            <div className="space-y-2">
              <motion.a 
                className="text-purple-700 dark:text-purple-300 font-medium cursor-pointer hover:opacity-80 transition-opacity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                href="https://instagram.com/rv_imman"
                target="_blank"
                rel="noopener noreferrer"
              >
                @rv_imman
              </motion.a>
              <div className="flex items-center justify-center gap-2 mt-1 sm:mt-0">
                  <motion.span 
                    className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-yellow-500/40 dark:border-yellow-500/30 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                  >
                    Author
                  </motion.span>
                  <motion.span 
                    className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 dark:from-purple-500/20 dark:to-blue-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 dark:border-purple-500/30 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    Admin
                  </motion.span>
                </div>
              <motion.p 
                className="text-transparent bg-clip-text bg-gradient-to-t to-blue-600/90 from-gray-800/90 dark:to-blue-300/80 dark:from-gray-900/80 max-w-md text-sm sm:text-base px-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                style={{ 
                  fontFamily: 'var(--font-pacifico), cursive', 
                  filter: 'contrast(0.9) brightness(1.1)',
                  wordSpacing: '0.1em',
                  letterSpacing: '0.01em'
                }}
              >
                " Turn your dev journey into a movement—share, connect, and grow together. " 
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-blue-500/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ height: ["20%", "80%", "20%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 bg-blue-500/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
