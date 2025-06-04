"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./marquee.module.css";

declare global {
  interface Window {
    ResizeObserver: any;
  }
}

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
  const [duration, setDuration] = React.useState(20);
  const isMounted = React.useRef(false);
  const [isClient, setIsClient] = React.useState(false);

  // Set client-side rendering
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle mount and update
  React.useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    
    if (!isClient) return;
    
    const updateDuration = () => {
      if (!contentRef.current) return;
      
      const contentWidth = contentRef.current.scrollWidth / 2; // Since we duplicate the content
      const speed = 50; // pixels per second
      const calculatedDuration = Math.max(10, Math.min(60, contentWidth / speed));
      setDuration(calculatedDuration);
    };

    // Initial update
    updateDuration();
    
    // Update on window resize
    const handleResize = () => {
      updateDuration();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Set up ResizeObserver if available
    if (typeof window.ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateDuration);
      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseEnter = () => pauseOnHover && setIsPaused(true);
  const handleMouseLeave = () => pauseOnHover && setIsPaused(false);

  if (!isClient) {
    return <div className={cn(styles.marquee, className)} {...props} />;
  }

  return (
    <div
      ref={containerRef}
      className={cn(styles.marquee, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          styles.content,
          reverse ? styles.animateMarqueeReverse : styles.animateMarquee,
          isPaused && styles.animatePaused
        )}
        style={{
          '--duration': `${duration}s`,
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

// Export the Marquee component
export { Marquee as InlineMarquee };