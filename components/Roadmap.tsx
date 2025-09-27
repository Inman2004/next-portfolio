"use client";

import React, { forwardRef, useRef } from "react";
import {
  SiReact,
  SiNodedotjs,
  SiPostgresql,
  SiDocker,
} from "react-icons/si";
import BlurFade from "./ui/blur-fade";
import { AnimatedBeam } from "./ui/animated-beam";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white p-3 text-3xl text-black shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:bg-zinc-800 dark:text-white ${className}`}
    >
      {children}
    </div>
  );
});
Circle.displayName = "Circle";

const Roadmap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frontendRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<HTMLDivElement>(null);
  const databaseRef = useRef<HTMLDivElement>(null);
  const devopsRef = useRef<HTMLDivElement>(null);

  return (
    <section id="roadmap" className="py-24 sm:py-32">
      <BlurFade delay={0.25} inView>
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            My Full Stack Workflow
          </h2>
          <div
            className="relative flex w-full items-center justify-between"
            ref={containerRef}
          >
            <Circle ref={frontendRef}>
              <SiReact />
            </Circle>
            <Circle ref={backendRef}>
              <SiNodedotjs />
            </Circle>
            <Circle ref={databaseRef}>
              <SiPostgresql />
            </Circle>
            <Circle ref={devopsRef}>
              <SiDocker />
            </Circle>

            <AnimatedBeam
              containerRef={containerRef}
              fromRef={frontendRef}
              toRef={backendRef}
              duration={3}
              delay={0}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={backendRef}
              toRef={databaseRef}
              duration={3}
              delay={3}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={databaseRef}
              toRef={devopsRef}
              duration={3}
              delay={6}
            />
          </div>
        </div>
      </BlurFade>
    </section>
  );
};

export default Roadmap;