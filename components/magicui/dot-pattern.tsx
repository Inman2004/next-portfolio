"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useMemo, useState } from "react";

interface Dot {
  x: number;
  y: number;
  size: number;
  opacity: number;
  opacityDirection: number;
  duration: number;
  startTime: number;
}

interface CssDotPatternProps {
  width?: number;
  height?: number;
  dotSize?: number;
  color?: {
    light: string;
    dark: string;
  } | string;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
  glowColor?: {
    light: string;
    dark: string;
  } | string;
  glowDotsPercentage?: number;
  enableThemeAwareness?: boolean;
  [key: string]: unknown;
}

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Helper function to ensure valid color format
const ensureRgba = (color: string, alpha: number): string => {
  try {
    // If it's a hex color
    if (color.startsWith('#')) {
      return hexToRgba(color, alpha);
    }

    // If it's already an rgba color, extract the RGB values and apply new alpha
    const rgbaMatch = color.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i);
    if (rgbaMatch) {
      const r = rgbaMatch[1];
      const g = rgbaMatch[2];
      const b = rgbaMatch[3];
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // If it's an rgb color, convert to rgba with new alpha
    const rgbMatch = color.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)$/i);
    if (rgbMatch) {
      const r = rgbMatch[1];
      const g = rgbMatch[2];
      const b = rgbMatch[3];
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Fallback to black with specified alpha
    return `rgba(0, 0, 0, ${alpha})`;
  } catch (e) {
    console.error('Error processing color:', color, e);
    return `rgba(0, 0, 0, ${alpha})`;
  }
};

const CssDotPattern = React.memo(function CssDotPattern({
  width = 16,
  height = 16,
  dotSize = 1,
  color = {
    light: 'rgba(99, 102, 241, 0.9)',
    dark: 'rgba(165, 180, 252, 0.5)'
  },
  className,
  style = {},
  glow = false,
  glowColor = {
    light: 'rgba(99, 102, 241, 0.9)',
    dark: 'rgba(165, 180, 252, 0.6)'
  },
  glowDotsPercentage = 10,
  enableThemeAwareness = true,
  ...props
}: CssDotPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const animationFrameId = useRef<number | null>(null);
  const dots = useRef<Dot[]>([]);

  const resolvedColor = useMemo(() => {
    if (typeof color === 'string') return color;
    return isDarkMode ? color.dark : color.light;
  }, [color, isDarkMode]);

  const resolvedGlowColor = useMemo(() => {
    if (typeof glowColor === 'string') return glowColor;
    return isDarkMode ? glowColor.dark : glowColor.light;
  }, [glowColor, isDarkMode]);

  const patternStyle: React.CSSProperties = useMemo(() => ({
    backgroundImage: `radial-gradient(circle at ${dotSize}px ${dotSize}px, ${resolvedColor} ${dotSize}px, transparent 0)`,
    backgroundPosition: '0 0',
    transition: 'background-image 0.5s ease, opacity 0.3s ease',
    opacity: 0.8,
    ...style,
  }), [dotSize, resolvedColor, width, height, style]);

  useEffect(() => {
    if (!enableThemeAwareness) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    
    setIsDarkMode(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableThemeAwareness]);
  useEffect(() => {
    if (!glow || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    if (!ctx || !container) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const initializeDots = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dotSpacing = Math.max(width, height);
      const cols = Math.ceil(rect.width / dotSpacing) + 1;
      const rows = Math.ceil(rect.height / dotSpacing) + 1;
      const totalDots = cols * rows;
      const glowDotsCount = Math.max(4, Math.floor(totalDots * (glowDotsPercentage / 100)));
      dots.current = [];
      for (let i = 0; i < glowDotsCount; i++) {
        dots.current.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size: 0.5 + Math.random(),
          opacity: Math.random() * 0.5,
          opacityDirection: 1,
          duration: 3 + Math.random() * 4,
          startTime: Date.now() + Math.random() * 2000,
        });
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const animate = () => {
      if (!ctx || !container) return;
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const currentTime = Date.now();

      dots.current.forEach(dot => {
        const elapsed = (currentTime - dot.startTime) / 1000;
        const progress = (Math.sin(elapsed * Math.PI * 2 / dot.duration) + 1) / 2;
        dot.opacity = progress;

        const gradient = ctx.createRadialGradient(
          dot.x, 
          dot.y, 
          0, 
          dot.x, 
          dot.y, 
          dot.size * dotSize * 3
        );
        
        const startColor = ensureRgba(resolvedGlowColor, dot.opacity);
        const endColor = ensureRgba(resolvedGlowColor, 0);
        
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!container) return;
      resizeCanvas();
      initializeDots();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    
    initializeDots();
    animate();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [glow, width, height, glowDotsPercentage, dotSize, resolvedGlowColor]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 z-0 h-full w-full",
        className
      )}
      style={patternStyle}
      {...props}
    >
      {glow && <canvas ref={canvasRef} className="absolute inset-0" />}
    </div>
  );
});

CssDotPattern.displayName = 'CssDotPattern';

export { CssDotPattern };
