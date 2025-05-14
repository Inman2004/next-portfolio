"use client";
import React, { useState } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  speed?: number;
}

/**
 * InlineMarquee Component
 * 
 * A marquee component that uses a global style tag and inline styles
 * for maximum compatibility with any framework.
 */
export function InlineMarquee({
  children,
  className = "",
  pauseOnHover = false,
  direction = "left",
  speed = 1,
}: MarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  
  // Create a unique ID for this instance
  const id = React.useId().replace(/:/g, "");
  
  // Calculate the duration based on speed (inverse relationship)
  const duration = 25 / speed;
  
  // Handle mouse events for pausing
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  // Global style with keyframes
  const globalStyle = `
    @keyframes marquee-scroll-left-${id} {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    
    @keyframes marquee-scroll-right-${id} {
      from { transform: translateX(-50%); }
      to { transform: translateX(0); }
    }
  `;
  
  // Container and content styles
  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
    minWidth: "100%",
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
  };
  
  const scrollerStyle: React.CSSProperties = {
    display: "flex",
    whiteSpace: "nowrap",
    padding: "0.75rem 0",
    willChange: "transform",
    animation: `marquee-scroll-${direction === "left" ? "left" : "right"}-${id} ${duration}s linear infinite`,
    animationPlayState: isPaused ? "paused" : "running",
  };
  
  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexShrink: 0,
    gap: "1rem",
    paddingRight: "1rem",
    minWidth: "100%",
    justifyContent: "space-around",
    textWrap: "wrap",
  };

  return (
    <>
      {/* Global style tag with keyframes */}
      <style dangerouslySetInnerHTML={{ __html: globalStyle }} />
      
      <div 
        className={className}
        style={containerStyle}
      >
        <div
          style={scrollerStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div style={contentStyle}>
            {children}
          </div>
          <div style={contentStyle}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}