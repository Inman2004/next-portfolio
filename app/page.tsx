"use client";
import React, { Suspense, lazy, useEffect, useState } from "react";
import { motion as m, useReducedMotion } from "framer-motion";
// import { CssDotPattern } from "@/components/magicui/dot-pattern";
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
const LangCloud = lazy(() => import("@/components/LangCloud").then(module => ({ default: module.default })));

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
          <Suspense fallback={<Loader />}>
            <Hero />
          </Suspense>
          
          <Suspense fallback={<Loader />}>
            <Projects showAll={false} maxItems={3} />
          </Suspense>

          <BlurFadeWrapper delay={0.1}>
            <Suspense fallback={null}>
              <Roadmap />
            </Suspense>
          </BlurFadeWrapper>

          <BlurFadeWrapper delay={0.2}>
            <Suspense fallback={null}>
              <LangCloud />
            </Suspense>
          </BlurFadeWrapper>

          <BlurFadeWrapper delay={0.3}>
            <Suspense fallback={null}>
              <Experience />
            </Suspense>
          </BlurFadeWrapper>

          <BlurFadeWrapper delay={0.4}>
            <Suspense fallback={null}>
              <Testimonials />
            </Suspense>
          </BlurFadeWrapper>

          <BlurFadeWrapper delay={0.5}>
            <Suspense fallback={null}>
              <Comments />
            </Suspense>
          </BlurFadeWrapper>

          <BlurFadeWrapper delay={0.6}>
            <Suspense fallback={null}>
              <Contact />
            </Suspense>
          </BlurFadeWrapper>
        </div>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
