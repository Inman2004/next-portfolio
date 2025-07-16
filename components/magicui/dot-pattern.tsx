"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";

/**
 * CssDotPattern Component Props with glow support and theme awareness
 */
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

/**
 * CssDotPattern Component with optional glow effect and theme support
 *
 * A highly optimized dot pattern implementation using CSS backgrounds
 * with an optional glow effect that maintains good performance.
 * Supports both light and dark themes with smooth transitions.
 *
 * @component
 *
 * @example
 * // With theme-aware glow effect
 * <CssDotPattern 
 *   width={24} 
 *   height={24} 
 *   glow={true}
 *   glowDotsPercentage={15}
 *   enableThemeAwareness={true}
 * />
 */
export function CssDotPattern({
  width = 16,
  height = 16,
  dotSize = 1,
  color = {
    light: 'rgba(99, 102, 241, 0.9)',  // indigo-500 with low opacity for light mode
    dark: 'rgba(165, 180, 252, 0.5)'   // indigo-300 with low opacity for dark mode
  },
  className,
  style,
  glow = false,
  glowColor = {
    light: 'rgba(99, 102, 241, 0.9)',  // indigo-500 for light mode
    dark: 'rgba(165, 180, 252, 0.6)'    // indigo-300 for dark mode
  },
  glowDotsPercentage = 10,
  enableThemeAwareness = true,
  ...props
}: CssDotPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowDots, setGlowDots] = useState<{left: string, top: string, size: number, delay: number, duration: number}[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    if (!enableThemeAwareness) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    
    // Set initial value
    setIsDarkMode(mediaQuery.matches);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableThemeAwareness]);

  // Handle resize and calculate dimensions
  useEffect(() => {
    if (!glow) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width: containerWidth, height: containerHeight } = 
          containerRef.current.getBoundingClientRect();
        
        // Only update if dimensions actually changed significantly (more than 10px)
        if (Math.abs(dimensions.width - containerWidth) > 10 || 
            Math.abs(dimensions.height - containerHeight) > 10) {
          setDimensions({ 
            width: Math.max(containerWidth, 0), 
            height: Math.max(containerHeight, 0) 
          });
        }
      }
    };

    updateDimensions();
    
    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDimensions, 150);
    };
    
    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [glow, dimensions]);

  // Calculate glow dots positions with more natural distribution
  useEffect(() => {
    if (!glow || dimensions.width === 0 || dimensions.height === 0) return;

    const dotSpacing = Math.max(width, height);
    const cols = Math.ceil(dimensions.width / dotSpacing) + 1;
    const rows = Math.ceil(dimensions.height / dotSpacing) + 1;
    const totalDots = cols * rows;
    const glowDotsCount = Math.max(4, Math.floor(totalDots * (glowDotsPercentage / 100)));
    
    const newGlowDots = [];
    const usedPositions = new Set();
    
    // Generate random positions for glow dots with minimum spacing
    while (newGlowDots.length < glowDotsCount && newGlowDots.length < totalDots) {
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);
      const positionKey = `${col},${row}`;
      
      // Skip if position is already used
      if (usedPositions.has(positionKey)) continue;
      
      // Mark nearby positions as used to prevent clustering
      for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
          usedPositions.add(`${c},${r}`);
        }
      }
      
      // Add some randomness to the position within the cell
      const posX = (col * dotSpacing) + (Math.random() * dotSpacing * 0.5) - (dotSpacing * 0.25);
      const posY = (row * dotSpacing) + (Math.random() * dotSpacing * 0.5) - (dotSpacing * 0.25);
      
      // Ensure position is within bounds
      if (posX >= 0 && posX <= dimensions.width && posY >= 0 && posY <= dimensions.height) {
        newGlowDots.push({
          left: `${posX}px`,
          top: `${posY}px`,
          size: 0.5 + Math.random(),  // Random size between 0.5x and 1.5x
          delay: Math.random() * 2,   // Staggered animation delay
          duration: 3 + Math.random() * 4,  // Random duration between 3-7s
        });
      }
    }
    
    setGlowDots(newGlowDots);
  }, [glow, dimensions, width, height, glowDotsPercentage]);

  // Get the appropriate color based on theme
  const getColor = (colorProp: string | {light: string, dark: string}) => {
    if (typeof colorProp === 'string') return colorProp;
    return isDarkMode ? colorProp.dark : colorProp.light;
  };

  const resolvedColor = getColor(color);
  const resolvedGlowColor = getColor(glowColor);

  // Base pattern styles with theme transition
  const patternStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(
        circle at ${dotSize}px ${dotSize}px,
        ${resolvedColor} ${dotSize}px,
        transparent 0
      ),
      linear-gradient(
        180deg,
        transparent 0%,
        transparent 50%,
        transparent 100%
      ),
      linear-gradient(
        90deg,
        transparent 0%,
        transparent 50%,
        transparent 100%
      )`,
    backgroundSize: `${width}px ${height}px`,
    backgroundPosition: '0 0',
    transition: 'background-image 0.5s ease, opacity 0.3s ease',
    opacity: 0.8,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 z-0 h-full w-full dot-pattern-container",
        "transition-all duration-500",
        !isDarkMode && "bg-gradient-to-br from-blue-50/90 to-purple-50/90",
        className
      )}
      style={patternStyle}
      {...props}
    >
      {glow && glowDots.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {glowDots.map((dot, index) => {
            const size = dotSize * dot.size;
            const glowSpread = size * 1.5;
            
            return (
              <div
                key={index}
                className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: dot.left,
                  top: dot.top,
                  background: resolvedGlowColor,
                  boxShadow: isDarkMode 
                    ? `0 0 ${glowSpread}px ${size}px ${resolvedGlowColor}`
                    : `0 0 ${glowSpread * 1.5}px ${size * 1.2}px ${resolvedGlowColor}`,
                  opacity: 0,
                  animation: `pulse ${dot.duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                  animationDelay: `${dot.delay}s`,
                  willChange: 'transform, opacity, box-shadow',
                  transition: 'opacity 0.5s ease, box-shadow 0.5s ease',
                }}
              />
            );
          })}
        </div>
      )}
      <style jsx={true} global={true}>{`
        @keyframes pulse {
          0%, 100% {
            opacity: ${isDarkMode ? 0.3 : 0.9};
            transform: translate(-50%, -50%) scale(${isDarkMode ? 0.9 : 1}) 
                       rotate(${isDarkMode ? '0deg' : '5deg'});
            filter: ${isDarkMode ? 'none' : 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.5))'};
          }
          50% {
            opacity: ${isDarkMode ? 0.8 : 1};
            transform: translate(-50%, -50%) scale(${isDarkMode ? 1.1 : 1.4}) 
                       rotate(${isDarkMode ? '0deg' : '-5deg'});
            filter: ${isDarkMode ? 'none' : 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.8))'};
          }
        }

        ${!isDarkMode ? `
          .dot-pattern-container::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, 
              transparent 0%, 
              rgba(255,255,255,0.7) 100%);
            mix-blend-mode: overlay;
            pointer-events: none;
          }
        ` : ''}
      `}</style>
    </div>
  );
}