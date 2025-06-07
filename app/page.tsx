"use client";
import React from "react";
import { motion } from "framer-motion";
import { CssDotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Comments from "@/components/Comments";
import Hero from "@/components/Hero";
import Footer from '@/components/Footer';
import Testimonials from "@/components/Testimonials";
import Experience from "@/components/Experience";
import { useTheme } from "next-themes";
import MusicPlayer from "@/components/MusicPlayer";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={cn(
        "min-h-screen overflow-x-hidden w-full transition-colors duration-200",
        isDark 
          ? "bg-gradient-to-b from-gray-900 to-black text-white"
          : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900"
      )}
    >
      <CssDotPattern 
        className={cn(
          "fixed inset-0 pointer-events-none transition-opacity duration-300",
          isDark 
            ? "opacity-100 [mask-image:radial-gradient(750px_circle_at_center,white,transparent)]"
            : "opacity-30 [mask-image:radial-gradient(750px_circle_at_center,black,transparent)]"
        )}
        width={20}
        height={20}
        dotSize={1.2}
        glow={true}
        glowDotsPercentage={1}
        glowColor={isDark ? "rgba(63, 13, 163, 0.5)" : "rgba(99, 102, 241, 0.3)"}
      />
      
      <main className="flex flex-col items-center w-full relative z-10">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <Hero />
          <MusicPlayer />
          <Projects showAll={false} maxItems={3} />
          <Skills />
          <Experience />
          <Services />
          <Testimonials />
          <Comments />
          <Contact />
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
