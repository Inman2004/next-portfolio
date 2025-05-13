"use client";
import React from "react";
import { motion } from "framer-motion";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Comments from "@/components/Comments";
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden w-full"
    >
      <DotPattern
        className={cn(
          "fixed inset-0 [mask-image:radial-gradient(750px_circle_at_center,white,transparent)] pointer-events-none",
        )}
        glow={true}
      />
      
      <main className="flex flex-col items-center w-full">
        <div className="w-full max-w-[1400px] mx-auto px-6">
          <Hero />
          <Projects />
          <Skills />
          <Services />
          <Comments />
          <Contact />
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
