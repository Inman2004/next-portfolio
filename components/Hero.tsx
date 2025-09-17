"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id?: string;
  title: string;
  createdAt: {
    toDate: () => Date;
  };
  slug?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  [key: string]: any; // For any additional properties that might come from the API
}

import Image from "next/image";
import { MorphingText } from "@/components/magicui/morphing-text";
import { AuroraText } from "@/components/magicui/aurora-text";
import { FaBlog, FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Github, Linkedin, Quote } from "lucide-react";
import { SkillBadge } from "./skillColors";
import InteractiveCard3D from "./ThreeJS/HeroID";
import Link from "next/link";

export default function Hero() {
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cache key for the latest post
  const CACHE_KEY = 'latestBlogPost';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const fetchLatestPost = useCallback(async () => {
    try {
      // Check if we have a cached version that's still valid
      const cachedData = localStorage.getItem(CACHE_KEY);
      const now = new Date().getTime();
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (now - timestamp < CACHE_DURATION) {
          setLatestPost(data);
          setIsLoading(false);
          return;
        }
      }

      // If no valid cache, fetch fresh data via API
      const res = await fetch('/api/blog');
      const json = await res.json();
      const posts = Array.isArray(json?.posts) ? json.posts : [];
      
      if (posts.length > 0) {
        // Pick newest by createdAt
        posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const first = posts[0];
        // Normalize createdAt to match existing consumption
        const postData = {
          ...first,
          createdAt: first?.createdAt
            ? { toDate: () => new Date(first.createdAt as string) }
            : undefined,
        } as any;
        setLatestPost(postData);
        
        // Cache the result
        const cacheData = {
          data: postData,
          timestamp: now
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Error fetching latest blog post:', error);
      // If there's an error but we have cached data, use that
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        setLatestPost(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchLatestPost();
    }
  }, [isClient, fetchLatestPost]);
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
                  "Junior Full-Stack Developer",
                  "Front-end expert",
                  "AI/ML enthusiast",
                  "Tech Blogger",
                  "Open Source Contributor",
                ]}
                className="text-center lg:text-left !h-[160px] text-indigo-800/90 dark:text-indigo-300"
              />
            </div>
            <div className="my-2 space-y-6">
              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-green-600 dark:text-green-400">Hands-on</span> experience
                </div>
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-green-600 dark:text-green-400">15+</span> projects
                </div>
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-green-600 dark:text-green-400">High Activity</span> in GitHub
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
                  <SkillBadge skill="JavaScript" proficiency="Advanced" />
                  <SkillBadge skill="Python" proficiency="Expert" />
                  <SkillBadge skill="MongoDB" proficiency="Intermediate" />
                  <SkillBadge skill="Tailwind CSS" proficiency="Advanced" />
                  <SkillBadge skill="AI/ML" proficiency="Intermediate" />
                </div>
              </div>

              {/* Featured Project Teaser */}
              {!isLoading && latestPost ? (
    <Link href={`/blog/${latestPost.id}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="group relative mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-indigo-900/20 border border-blue-900 dark:border-indigo-900/50 cursor-pointer transition-all duration-300 hover:shadow-lg"
      >
        <span className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-900/50 text-orange-800 dark:text-gray-200 border border-gray-900 dark:border-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
          New <FaBlog className="inline text-lg text-orange-500 dark:text-orange-400" />
        </span>
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Latest Blog</p>
        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
          {latestPost.title}
        </h3>
        <p className="text-xs text-blue-600 dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
          {isClient && latestPost?.createdAt?.toDate 
            ? new Date(latestPost.createdAt.toDate()).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            : 'Read now'} →
        </p>
      </motion.div>
    </Link>
  ) : (
    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-indigo-900/20 border border-blue-100 dark:border-indigo-900/50">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {isClient ? 'Loading latest post...' : 'Latest post'}
      </p>
    </div>
  )}

              {/* Personal Touch */}
              {/* <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-4 max-w-lg">
                "I transform complex problems into elegant, user-centered solutions through clean code and thoughtful design."
              </p> */}
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
                className="px-6 sm:px-8 py-3 sm:py-4 border border-blue-500 dark:border-blue-500/30 dark:hover:border-blue-500 rounded-lg text-base sm:text-lg font-medium hover:bg-blue-500/10 dark:hover:bg-blue-500/10 transition-all duration-300 text-center text-blue-700 dark:text-blue-200 hover:text-blue-800 dark:hover:text-white w-full sm:w-auto"
              >
                Get to know me
              </motion.a>
            

            {/* Social Links */}
            <div className="flex ml-6 items-center gap-1 sm:gap-2 justify-center lg:justify-start flex-wrap">
              <motion.a
                href="https://github.com/Inman2004"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[rgb(109,40,217)] dark:text-[#a930d5] hover:bg-purple-500 dark:hover:bg-purple-500 hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
              >
                <Github className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/rv3d"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[rgb(10,92,180)] dark:text-[#0A66C2] hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
              >
                <Linkedin className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://twitter.com/rvimman_"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[rgb(0,0,0)] dark:text-[#fff] hover:bg-black dark:hover:bg-black hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
              >
                <FaXTwitter className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="mailto:rvimman@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[rgb(217,48,37)] dark:text-[#cf594e] hover:bg-red-500 dark:hover:bg-red-500 hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
              >
                <SiGmail className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://rvimman-two.vercel.app"
                target='_blank'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title='online resume'
                className="text-emerald-500 dark:text-emerald-500 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
              >
                <img src="/images/favicon.png" className="w-6 h-6" />
              </motion.a>
            </div>
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
