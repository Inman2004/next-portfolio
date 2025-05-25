"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to pause the marquee on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Optional class name for the marquee container
   */
  className?: string;
  /**
   * Optional children to render in the marquee
   */
  children: React.ReactNode;
}

/**
 * Marquee component that smoothly scrolls its children horizontally
 */
export function Marquee({
  className,
  pauseOnHover = false,
  reverse = false,
  children,
  ...props
}: MarqueeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [contentWidth, setContentWidth] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);

  // Set mounted state to prevent hydration issues
  React.useEffect(() => {
    setIsMounted(true);
    
    const updateSizes = () => {
      if (contentRef.current) {
        setContentWidth(contentRef.current.scrollWidth);
      }
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);
    
    return () => {
      window.removeEventListener('resize', updateSizes);
    };
  }, []);

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

  // Calculate duration based on content and container width
  const duration = React.useMemo(() => {
    if (contentWidth === 0 || containerWidth === 0) return 20;
    const speed = 100; // pixels per second
    return Math.max(10, (contentWidth + containerWidth) / speed);
  }, [contentWidth, containerWidth]);

  // Only render the marquee content if mounted to prevent hydration issues
  if (!isMounted) {
    return <div ref={containerRef} className={cn("relative overflow-hidden w-full", className)} />;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden w-full", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          "flex flex-nowrap gap-8 w-max",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          isPaused && "[animation-play-state:paused]"
        )}
        style={{
          '--duration': `${duration}s`,
          transition: 'all 0.3s ease-in-out',
        } as React.CSSProperties}
      >
        {React.Children.map(children, (child, i) => (
          <div key={`item-${i}`} className="flex-shrink-0">
            {child}
          </div>
        ))}
        {React.Children.map(children, (child, i) => (
          <div key={`item-${i}-duplicate`} className="flex-shrink-0" aria-hidden="true">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

// Add global styles for the marquee animations
const MarqueeStyles = () => (
  <style jsx global>{`
    @keyframes marquee {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(calc(-50% - 2rem));
      }
    }
    @keyframes marquee-reverse {
      0% {
        transform: translateX(calc(-50% - 2rem));
      }
      100% {
        transform: translateX(0);
      }
    }
    .animate-marquee {
      animation: marquee var(--duration, 60s) linear infinite;
      animation-play-state: running;
    }
    .animate-marquee-reverse {
      animation: marquee-reverse var(--duration, 60s) linear infinite;
      animation-play-state: running;
    }
    [animation-play-state="paused"] {
      animation-play-state: paused !important;
    }
  `}</style>
);

// Export the Marquee component and its styles
export { Marquee as InlineMarquee, MarqueeStyles };