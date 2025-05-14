"use client";
import React, { memo } from "react";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

/**
 * AuroraText Component
 * 
 * Creates a text with animated gradient effect. This fixed version
 * includes the CSS keyframes definition directly in the component.
 * 
 * @param {React.ReactNode} children - The text content to display
 * @param {string} [className] - Additional CSS classes
 * @param {string[]} [colors] - Array of colors for the gradient
 * @param {number} [speed] - Animation speed (higher = faster)
 */
export const AuroraText = memo(
  ({
    children,
    className = "",
    colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"],
    speed = 1,
  }: AuroraTextProps) => {
    // Generate unique ID for keyframe animation
    const uniqueId = React.useId().replace(/:/g, "");
    const animationName = `aurora-${uniqueId}`;
    
    // Create keyframes for the animation
    const keyframes = `
      @keyframes ${animationName} {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `;
    
    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textFillColor: "transparent",
      backgroundSize: "200% auto",
      animation: `${animationName} ${10 / speed}s ease infinite`,
    };
    
    return (
      <>
        {/* Insert the keyframes */}
        <style jsx>{keyframes}</style>
        
        <span className={`relative inline-block ${className}`}>
          <span className="sr-only">{children}</span>
          <span
            className="relative"
            style={gradientStyle}
            aria-hidden="true"
          >
            {children}
          </span>
        </span>
      </>
    );
  },
);

AuroraText.displayName = "AuroraText";