"use client";

import React, { forwardRef, useRef } from "react";
import {
  SiReact,
  SiNodedotjs,
  SiPostgresql,
  SiDocker,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiRedux,
  SiJavascript,
  SiMongodb,
  SiFastapi,
  SiGit,
  SiHtml5,
  SiCss3,
  SiVercel,
  SiAmazonaws,
  SiGithub,
} from "react-icons/si";
import { AnimatedBeam } from "./ui/animated-beam";
import { motion as m } from "framer-motion";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full border-2 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 p-1.5 sm:p-2 md:p-2.5 lg:p-3 text-xl sm:text-2xl md:text-3xl text-card-foreground shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ring-1 ring-border/50 transition-all duration-200 ease-out hover:scale-105 hover:-translate-y-0.5 hover:ring-2 dark:bg-card/80 dark:text-card-foreground ${className}`}
    >
      {children}
    </div>
  );
});
Circle.displayName = "Circle";

const LabeledCircle = forwardRef<
  HTMLDivElement,
  { className?: string; label: string; children: React.ReactNode }
>(({ className, label, children }, ref) => {
  return (
    <div className="flex flex-col items-center">
      <Circle ref={ref} className={className}>
        {children}
      </Circle>
      <span className="mt-1 hidden md:block text-xs text-muted-foreground">{label}</span>
    </div>
  );
});
LabeledCircle.displayName = "LabeledCircle";

const Roadmap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactRef = useRef<HTMLDivElement>(null);
  const tailwindRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const typescriptRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const cssRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<HTMLDivElement>(null);
  const mongodbRef = useRef<HTMLDivElement>(null);
  const postgresqlRef = useRef<HTMLDivElement>(null);
  const devopsRef = useRef<HTMLDivElement>(null);
  const vercelRef = useRef<HTMLDivElement>(null);


  return (
    <section id="roadmap" className="py-24 sm:py-32">
      <div className="container mx-auto max-w-5xl px-4">
      <div className="flex flex-col items-center mb-16">
        <m.h2
          initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-400 dark:to-violet-500 bg-clip-text text-transparent p-2 mb-4"
          >
           My Full Stack 
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-600 dark:text-zinc-400 text-center max-w-2xl"
          >
            Comprehensive solutions tailored to your needs. From web development to deployment, I&apos;ve got you covered.
          </m.p>
        </div>
          <div
            className="relative flex w-full items-center justify-center md:justify-between gap-3 sm:gap-4 md:gap-6 flex-wrap md:flex-nowrap"
            ref={containerRef}
          >
            {/* Decorative soft gradient background (rgba-based for Tailwind compatibility) */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_60%)]" />

            <div className="flex flex-col gap-1 sm:gap-1.5 items-center">
              <LabeledCircle className="hover:!bg-orange-500/20 border-orange-500/50" ref={htmlRef} label="HTML5">
                <SiHtml5 />
              </LabeledCircle>
              <LabeledCircle className="hover:!bg-emerald-500/20 border-emerald-500/50" ref={cssRef} label="CSS3">
                <SiCss3 />
              </LabeledCircle>
              <LabeledCircle className="hover:!bg-cyan-500/30 border-cyan-500/50" ref={reactRef} label="React + Redux">
                <SiReact />
                <SiRedux />
              </LabeledCircle>
              <LabeledCircle className="hover:!bg-sky-500/30 border-sky-500/50" ref={tailwindRef} label="Tailwind CSS">
                <SiTailwindcss />
              </LabeledCircle>
              <LabeledCircle className="hover:!bg-blue-500/30 border-blue-500/50" ref={typescriptRef} label="TypeScript / JS">
                <SiTypescript />
                <SiJavascript />
              </LabeledCircle>
            </div>
            <LabeledCircle className="hover:!bg-white/30 dark:hover:!bg-black/30 border-black/50 dark:border-white/50" ref={nextRef} label="Next.js">
              <SiNextdotjs />
            </LabeledCircle>
            <LabeledCircle className="hover:!bg-lime-500/30 border-lime-500/50" ref={backendRef} label="Node / FastAPI">
              <SiNodedotjs />
              <SiFastapi />
            </LabeledCircle>
            <div className="flex flex-col gap-12 sm:gap-4.5 items-center">
              <LabeledCircle className="hover:!bg-sky-600/20 border-sky-600/50" ref={postgresqlRef} label="PostgreSQL">
                <SiPostgresql />
              </LabeledCircle>
              <LabeledCircle className="hover:!bg-emerald-500/20 border-emerald-500/50" ref={mongodbRef} label="MongoDB">
                <SiMongodb />
              </LabeledCircle>
            </div>
            <LabeledCircle className="hover:!bg-violet-500/20 border-violet-500/50" ref={devopsRef} label="Docker + GitHub">
              <SiDocker />
              <SiGithub />
            </LabeledCircle>
            <LabeledCircle className="hover:!bg-orange-500/20 border-orange-500/50" ref={vercelRef} label="Vercel + AWS">
              <SiVercel />
              <SiAmazonaws />
            </LabeledCircle>

            <AnimatedBeam
              containerRef={containerRef}
              fromRef={htmlRef}
              toRef={nextRef}
              pathWidth={1.5}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={cssRef}
              toRef={nextRef}
              pathWidth={1.5}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={reactRef}
              toRef={nextRef}
              pathWidth={1.5}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={tailwindRef}
              toRef={nextRef}
              pathWidth={1.5}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={typescriptRef}
              toRef={nextRef}
              pathWidth={1.5}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={nextRef}
              toRef={backendRef}
              duration={5}
              pathWidth={2}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={postgresqlRef}
              toRef={backendRef}
              delay={3}
              pathWidth={1.5}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={mongodbRef}
              toRef={backendRef}
              duration={3}
              delay={3}
              pathWidth={1.5}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={backendRef}
              toRef={devopsRef}
              delay={5}
              pathWidth={2}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={devopsRef}
              toRef={vercelRef}
              delay={3}
              pathWidth={2}
            />
          </div>
        </div>
    </section>
  );
};

export default Roadmap;