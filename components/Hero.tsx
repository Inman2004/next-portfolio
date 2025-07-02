"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MorphingText } from "@/components/magicui/morphing-text";
import { AuroraText } from "@/components/magicui/aurora-text";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Github, Linkedin, Quote } from "lucide-react";
import { SkillBadge } from "./skillColors";
import AvatarCard3D from "./ThreeJS/AvatarCard3d";
import InteractiveCard3D from "./ThreeJS/HeroID";

interface QuoteType {
  quote: string;
  author: string;
}

export default function Hero() {
  // const [localQuotes, setLocalQuotes] = useState<QuoteType[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [quote, setQuote] = useState<QuoteType | null>(null);
  // const [isAnimating, setIsAnimating] = useState(false);
  // const quoteRef = useRef<HTMLDivElement>(null);
  // const hasFetchedRef = useRef(false);

  // const fetchQuotes = useCallback(async () => {
  //   // Prevent multiple simultaneous fetches
  //   if (hasFetchedRef.current) return;
    
  //   try {
  //     hasFetchedRef.current = true;
  //     const response = await fetch('/api/quotes');
  //     if (!response.ok) throw new Error('Failed to fetch quotes');
  //     const data = await response.json();
      
  //     setLocalQuotes(prevQuotes => {
  //       // Only update if quotes have changed
  //       if (JSON.stringify(prevQuotes) === JSON.stringify(data)) {
  //         return prevQuotes;
  //       }
  //       return data;
  //     });
      
  //     // Set initial quote if not set or if quotes changed
  //     if (data.length > 0 && (!quote || !localQuotes.some(q => q.quote === quote.quote && q.author === quote.author))) {
  //       const randomIndex = Math.floor(Math.random() * data.length);
  //       setQuote(data[randomIndex]);
  //     }
      
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Failed to load quotes:", error);
  //     // Fallback to local quotes in case of error
  //     const fallbackQuotes = [
  //       {
  //         quote: "The only way to do great work is to love what you do.",
  //         author: "Steve Jobs"
  //       },
  //       {
  //         quote: "Innovation distinguishes between a leader and a follower.",
  //         author: "Steve Jobs"
  //       }
  //     ];
      
  //     setLocalQuotes(prevQuotes => 
  //       prevQuotes.length > 0 ? prevQuotes : fallbackQuotes
  //     );
      
  //     if (!quote && fallbackQuotes.length > 0) {
  //       const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  //       setQuote(fallbackQuotes[randomIndex]);
  //     }
      
  //     setIsLoading(false);
  //   } finally {
  //     hasFetchedRef.current = false;
  //   }
  // }, [quote, localQuotes]);

  // useEffect(() => {
  //   fetchQuotes();
  // }, [fetchQuotes]);

  // // Function to get a new random quote
  // const getNewQuote = useCallback(() => {
  //   if (localQuotes.length === 0 || isAnimating) return;
    
  //   setIsAnimating(true);
    
  //   // Wait for the fade-out animation to complete
  //   const timer = setTimeout(() => {
  //     const currentIndex = localQuotes.findIndex(q => 
  //       q.quote === quote?.quote && q.author === quote?.author
  //     );
      
  //     let newIndex;
  //     // Ensure we get a different quote if there are multiple quotes
  //     if (localQuotes.length > 1) {
  //       do {
  //         newIndex = Math.floor(Math.random() * localQuotes.length);
  //       } while (newIndex === currentIndex);
  //     } else {
  //       newIndex = 0;
  //     }
      
  //     setQuote(localQuotes[newIndex]);
  //     // Small delay before allowing next animation
  //     setTimeout(() => setIsAnimating(false), 100);
  //   }, 500); // Match this with your CSS transition time
    
  //   return () => clearTimeout(timer);
  // }, [localQuotes, quote?.quote, quote?.author, isAnimating]);

  // // Removed the interval for quote rotation to show only one quote per session
  
  // // Set initial quote when localQuotes is loaded
  // useEffect(() => {
  //   if (localQuotes.length > 0 && !quote) {
  //     const randomIndex = Math.floor(Math.random() * localQuotes.length);
  //     setQuote(localQuotes[randomIndex]);
  //     setIsLoading(false);
  //   }
  // }, [localQuotes, quote]);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative w-full overflow-hidden pb-24 pt-24 md:pt-24 lg:pt-0"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-pattern" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-500/5 to-purple-500/10" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 pt-8 lg:pt-12">
          {/* Left Content - Text */}
          <div className="w-full lg:max-w-[60%] xl:max-w-[60%]">
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

            <div className="text-sm sm:text-base md:text-lg text-indigo-700 dark:text-indigo-300 mb-2 min-h-[120px] flex items-center justify-center lg:justify-start">
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
            <div className="my-2 space-y-6">
              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-blue-600 dark:text-blue-400">2+</span> years experience
                </div>
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-blue-600 dark:text-blue-400">15+</span> projects
                </div>
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-blue-600 dark:text-blue-400">High Activity+</span> in GitHub
                </div>
              </div>

              {/* Technical Stack with Hover Effects */}
              <div>
                <p className="text-sm text-blue-600/80 dark:text-blue-300/80 mb-2 ml-2 font-livvic">
                  My current technical stack focuses on:
                </p>
                <div className="flex flex-wrap gap-2 mb-1 ml-2">
                  <SkillBadge skill="Next.js" proficiency="Advanced" />
                  <SkillBadge skill="React" proficiency="Advanced" />
                  <SkillBadge skill="TypeScript" proficiency="Advanced" />
                  <SkillBadge skill="Node.js" proficiency="Intermediate" />
                  <SkillBadge skill="MongoDB" proficiency="Intermediate" />
                  <SkillBadge skill="Tailwind CSS" proficiency="Advanced" />
                  <SkillBadge skill="3D Artistry" proficiency="Expert" />
                </div>
              </div>

              {/* Featured Project Teaser */}
              {/* <motion.div 
                whileHover={{ scale: 1.02 }}
                className="group relative mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-indigo-900/20 border border-blue-100 dark:border-indigo-900/50 cursor-pointer transition-all duration-300 hover:shadow-lg"
              >
                <div className="absolute -top-2 -right-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  New
                </div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Latest Project</p>
                <p className="text-sm text-blue-600 dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
                  Check out my work on <span className="font-medium">Interactive 3D Portfolio</span> →
                </p>
              </motion.div> */}

              {/* Personal Touch */}
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-4 max-w-lg">
                "I transform complex problems into elegant, user-centered solutions through clean code and thoughtful design."
              </p>
                
              {/* <div className="w-full max-w-3xl mx-auto space-y-3" ref={quoteRef}>
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
              </div> */}
            </div>
            <div className="flex flex-col my-4 sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-base sm:text-lg font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-blue-500/25 text-white text-center w-full sm:w-auto"
              >
                View My Work
              </motion.a>
              <motion.a
                href="/personal"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 sm:py-4 border border-blue-500/30 dark:border-blue-500/30 rounded-lg text-base sm:text-lg font-medium hover:bg-blue-500/10 dark:hover:bg-blue-500/10 transition-all duration-300 text-center text-blue-700 dark:text-blue-200 hover:text-blue-800 dark:hover:text-white w-full sm:w-auto"
              >
                Get to know me
              </motion.a>
            </div>

            {/* Social Links */}
            <div className="mt-6 lg:mt-12 sm:mt-10 flex items-center gap-4 sm:gap-6 justify-center lg:justify-start flex-wrap">
              <motion.a
                href="https://github.com/Inman2004"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#6d28d9] dark:text-[#a930d5] hover:opacity-80 transition-opacity"
              >
                <Github className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/rv3d"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#0a5cb4] dark:text-[#0A66C2] hover:opacity-80 transition-opacity"
              >
                <Linkedin className="w-6 h-6" />
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
          </div>

          {/* Right Content - Image */}
          <InteractiveCard3D />
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
