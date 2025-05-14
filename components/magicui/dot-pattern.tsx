"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";

/**
 * CssDotPattern Component Props with glow support
 */
interface CssDotPatternProps {
  width?: number;
  height?: number;
  dotSize?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
  glowColor?: string;
  glowDotsPercentage?: number;
  [key: string]: unknown;
}

/**
 * CssDotPattern Component with optional glow effect
 *
 * A highly optimized dot pattern implementation using CSS backgrounds
 * with an optional glow effect that maintains good performance.
 *
 * @component
 *
 * @example
 * // With glow effect
 * <CssDotPattern 
 *   width={24} 
 *   height={24} 
 *   glow={true}
 *   glowDotsPercentage={15}
 * />
 */
export function CssDotPattern({
  width = 16,
  height = 16,
  dotSize = 1,
  color = "rgba(163, 163, 163, 0.8)",
  className,
  style,
  glow = false,
  glowColor = "rgba(163, 163, 163, 0.5)",
  glowDotsPercentage = 10,
  ...props
}: CssDotPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowDots, setGlowDots] = useState<{left: string, top: string}[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize and calculate dimensions
  useEffect(() => {
    if (!glow) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width: containerWidth, height: containerHeight } = 
          containerRef.current.getBoundingClientRect();
        
        // Only update if dimensions actually changed
        if (dimensions.width !== containerWidth || dimensions.height !== containerHeight) {
          setDimensions({ width: containerWidth, height: containerHeight });
        }
      }
    };

    updateDimensions();
    
    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDimensions, 100);
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [glow, dimensions.width, dimensions.height]);

  // Calculate glow dots positions
  useEffect(() => {
    if (!glow || dimensions.width === 0 || dimensions.height === 0) return;

    const cols = Math.ceil(dimensions.width / width);
    const rows = Math.ceil(dimensions.height / height);
    const totalDots = cols * rows;
    const glowDotsCount = Math.floor(totalDots * (glowDotsPercentage / 100));
    
    const newGlowDots = [];
    
    // Generate random positions for glow dots
    for (let i = 0; i < glowDotsCount; i++) {
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);
      
      newGlowDots.push({
        left: `${col * width + width/2}px`,
        top: `${row * height + height/2}px`
      });
    }
    
    setGlowDots(newGlowDots);
  }, [dimensions, width, height, glow, glowDotsPercentage]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(${color} ${dotSize}px, transparent 0)`,
        backgroundSize: `${width}px ${height}px`,
        backgroundPosition: `${width/2}px ${height/2}px`,
        ...style
      }}
      aria-hidden="true"
      {...props}
    >
      {/* Render glow effect dots */}
      {glow && glowDots.map((dot, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            width: `${dotSize * 2}px`,
            height: `${dotSize * 2}px`,
            backgroundColor: glowColor,
            boxShadow: `0 0 ${dotSize * 2}px ${dotSize}px ${glowColor}`,
            transform: 'translate(-50%, -50%)',
            left: dot.left,
            top: dot.top,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}