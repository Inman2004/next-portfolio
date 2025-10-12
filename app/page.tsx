"use client";
import React from "react";
import { motion as m, useReducedMotion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import Projects from "@/components/Projects";
import Roadmap from "@/components/Roadmap";
import Contact from "@/components/Contact";
import Comments from "@/components/Comments";
import Hero from "@/components/Hero";
import Footer from '@/components/Footer';
import { BlurFade } from "@/components/ui";
import Testimonials from "@/components/Testimonials";
import Experience from "@/components/Experience";
import { useTheme } from "next-themes";
import SkillRoadMap from "@/components/SkillRoadMap";
import { LangCloud } from "@/components/LangCloud";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "min-h-screen w-full",
        isDark 
          ? "bg-gradient-to-b from-zinc-950 to-black text-white"
          : "bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900"
      )} />
    );
  }

  return (
    <div className={cn(
      "min-h-screen overflow-x-hidden w-full transition-colors duration-200",
      isDark 
        ? "bg-gradient-to-b from-zinc-950 to-black text-white"
        : "bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900"
    )}>
      <main className="flex flex-col items-center w-full relative z-10">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <Hero />
          <Projects showAll={false} maxItems={3} />
          <BlurFade delay={0.25 * 2} inView>
          <Roadmap />
          <LangCloud />
          </BlurFade>
          <BlurFade delay={0.25 * 4} inView>
            <Experience />
          </BlurFade>
          <BlurFade delay={0.25 * 5} inView>
            <Testimonials />
          </BlurFade>
          <BlurFade delay={0.25 * 6} inView>
            <Comments />
          </BlurFade>
          <BlurFade delay={0.25 * 7} inView>
            <Contact />
          </BlurFade>
        </div>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
