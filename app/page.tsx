"use client";
import React from "react";
import dynamic from "next/dynamic";
import { motion as m } from "framer-motion";
import { CssDotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import Projects from "@/components/Projects";
import Hero from "@/components/Hero";
import { useTheme } from "next-themes";
import SkillRoadMap from "@/components/SkillRoadMap";

const Roadmap = dynamic(() => import("@/components/Roadmap"));
const LangCloud = dynamic(() => import("@/components/LangCloud"));
const Experience = dynamic(() => import("@/components/Experience"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const Comments = dynamic(() => import("@/components/Comments"));
const Contact = dynamic(() => import("@/components/Contact"));
const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={cn(
        "min-h-screen overflow-x-hidden w-full transition-colors duration-200",
        isDark 
          ? "bg-gradient-to-b from-zinc-950 to-black text-white"
          : "bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900"
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
          <Projects showAll={false} maxItems={3} />
          <Roadmap />
          <LangCloud />
          <Experience />
          <Testimonials />
          <Comments />
          <Contact />
        </div>
      </main>
      
      <Footer />
    </m.div>
  );
}
