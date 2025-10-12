"use client";
<<<<<<< Updated upstream
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
=======
import React, { Suspense, lazy, useEffect, useState } from "react";
import { motion as m, useReducedMotion } from "framer-motion";
import { CssDotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Lazy load components with proper type annotations
const Hero = lazy(() => import("@/components/Hero").then(module => ({ default: module.default })));
const Projects = lazy(() => import("@/components/Projects").then(module => ({ default: module.default })));
const Roadmap = lazy(() => import("@/components/Roadmap").then(module => ({ default: module.default })));
const Contact = lazy(() => import("@/components/Contact").then(module => ({ default: module.default })));
const Comments = lazy(() => import("@/components/Comments").then(module => ({ default: module.default })));
const Footer = lazy(() => import('@/components/Footer').then(module => ({ default: module.default })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(module => ({ default: module.default })));
const Experience = lazy(() => import("@/components/Experience").then(module => ({ default: module.default })));
const SkillRoadMap = lazy(() => import("@/components/SkillRoadMap").then(module => ({ default: module.default })));
const LangCloud = lazy(() => import("@/components/LangCloud").then(module => ({ default: module.LangCloud })));

// Simple loader component
const Loader = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <div className="animate-pulse">Loading...</div>
  </div>
);

interface BlurFadeWrapperProps {
  children: React.ReactNode;
  delay?: number;
}

const BlurFadeWrapper = ({ children, delay = 0 }: BlurFadeWrapperProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  if (shouldReduceMotion) {
    return <div ref={ref}>{children}</div>;
  }

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </m.div>
  );
};
>>>>>>> Stashed changes

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
      {!shouldReduceMotion && (
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
          glowDotsPercentage={0.5}
          glowColor={isDark ? "rgba(63, 13, 163, 0.3)" : "rgba(99, 102, 241, 0.2)"}
        />
      )}
      
      <main className="flex flex-col items-center w-full relative z-10">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
<<<<<<< Updated upstream
          <Hero />
          <Projects showAll={false} maxItems={3} />
          <Roadmap />
          <LangCloud />
          <Experience />
          <Testimonials />
          <Comments />
          <Contact />
=======
          <Suspense fallback={<Loader />}>
            <Hero />
          </Suspense>
          
          <Suspense fallback={<Loader />}>
            <Projects showAll={false} maxItems={3} />
          </Suspense>

          <Suspense fallback={null}>
            <BlurFadeWrapper delay={0.1}>
              <Roadmap />
            </BlurFadeWrapper>
          </Suspense>

          <Suspense fallback={null}>
            <BlurFadeWrapper delay={0.2}>
              <LangCloud />
            </BlurFadeWrapper>
          </Suspense>

          <Suspense fallback={null}>
            <BlurFadeWrapper delay={0.3}>
              <Experience />
            </BlurFadeWrapper>
          </Suspense>

          <Suspense fallback={null}>
            <BlurFadeWrapper delay={0.4}>
              <Testimonials />
            </BlurFadeWrapper>
          </Suspense>

          <Suspense fallback={null}>
            <BlurFadeWrapper delay={0.5}>
              <Comments />
            </BlurFadeWrapper>
          </Suspense>

          <Suspense fallback={null}>
            <BlurFadeWrapper delay={0.6}>
              <Contact />
            </BlurFadeWrapper>
          </Suspense>
>>>>>>> Stashed changes
        </div>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
