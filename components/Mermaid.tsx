'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

interface MermaidProps {
  chart: string;
  className?: string;
}

export default function Mermaid({ chart, className = '' }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const { resolvedTheme } = useTheme();

  // Unified palette for light/dark themes
  const getThemeVariables = (isDark: boolean) => {
    // Cohesive indigo/blue/teal palette, tuned for contrast and harmony
    if (isDark) {
      return {
        // backgrounds
        background: 'hsl(222, 47%, 11%)',
        mainBkg: 'hsl(222, 45%, 14%)',
        secondBkg: 'hsl(222, 35%, 18%)',

        // text
        textColor: 'hsl(210, 20%, 92%)',
        titleColor: 'hsl(210, 20%, 95%)',

        // borders and lines
        border1: 'hsl(200, 30%, 45%)',
        border2: 'hsl(200, 25%, 38%)',
        lineColor: 'hsl(199, 89%, 48%)', // sky-500
        nodeBorder: 'hsl(200, 30%, 45%)',
        clusterBorder: 'hsl(200, 25%, 38%)',
        edgeLabelBackground: 'rgba(15,23,42,0.7)',

        // nodes
        primaryColor: 'hsl(219, 27%, 18%)', // slate-800
        primaryTextColor: 'hsl(210, 20%, 92%)',
        primaryBorderColor: 'hsl(200, 30%, 45%)',

        secondaryColor: 'hsl(221, 39%, 23%)', // slate-700
        secondaryTextColor: 'hsl(210, 20%, 92%)',
        secondaryBorderColor: 'hsl(199, 60%, 45%)',

        tertiaryColor: 'hsl(217, 33%, 17%)', // slate-800ish
        tertiaryTextColor: 'hsl(210, 20%, 92%)',
        tertiaryBorderColor: 'hsl(200, 25%, 38%)',

        // sequence/actors
        actorBkg: 'hsl(222, 40%, 16%)',
        actorBorder: 'hsl(199, 70%, 45%)',
        actorTextColor: 'hsl(210, 20%, 92%)',
        actorLineColor: 'hsl(199, 70%, 45%)',

        // notes
        noteBkgColor: 'rgba(14, 116, 144, 0.15)', // teal tint
        noteTextColor: 'hsl(210, 20%, 92%)',
        noteBorderColor: 'hsl(200, 30%, 45%)',

        // arrows
        arrowheadColor: 'hsl(199, 89%, 60%)',
        arrowMarkerColor: 'hsl(199, 89%, 60%)',

        // cScales for pies / class colors
        cScale0: 'hsl(199, 89%, 48%)',   // sky-500
        cScale1: 'hsl(217, 91%, 60%)',   // blue-500
        cScale2: 'hsl(174, 72%, 56%)',   // teal-400
        cScale3: 'hsl(262, 83%, 58%)',   // violet-500
        cScale4: 'hsl(142, 70%, 45%)',   // green-500
        cScale5: 'hsl(24, 95%, 64%)',    // orange-500
        cScale6: 'hsl(334, 73%, 52%)',   // pink-500
        cScale7: 'hsl(271, 91%, 65%)',   // purple-500
        cScale8: 'hsl(0, 84%, 60%)',     // red-500
        cScale9: 'hsl(45, 93%, 47%)',    // amber-500
      } as const;
    }
    return {
      // backgrounds
      background: 'hsl(220, 40%, 99%)',
      mainBkg: 'hsl(220, 45%, 98%)',
      secondBkg: 'hsl(220, 35%, 96%)',

      // text
      textColor: 'hsl(222, 47%, 23%)', // slate-800
      titleColor: 'hsl(222, 47%, 18%)',

      // borders and lines
      border1: 'hsl(220, 14%, 80%)',
      border2: 'hsl(220, 16%, 85%)',
      lineColor: 'hsl(217, 91%, 60%)', // blue-500
      nodeBorder: 'hsl(220, 14%, 75%)',
      clusterBorder: 'hsl(220, 16%, 80%)',
      edgeLabelBackground: 'rgba(255,255,255,0.85)',

      // nodes
      primaryColor: 'hsl(210, 100%, 97%)', // light blue tint
      primaryTextColor: 'hsl(222, 47%, 23%)',
      primaryBorderColor: 'hsl(217, 91%, 60%)',

      secondaryColor: 'hsl(192, 95%, 95%)', // light sky
      secondaryTextColor: 'hsl(222, 47%, 23%)',
      secondaryBorderColor: 'hsl(199, 89%, 48%)',

      tertiaryColor: 'hsl(168, 76%, 95%)', // light teal
      tertiaryTextColor: 'hsl(222, 47%, 23%)',
      tertiaryBorderColor: 'hsl(174, 72%, 56%)',

      // sequence/actors
      actorBkg: 'hsl(220, 35%, 96%)',
      actorBorder: 'hsl(217, 91%, 60%)',
      actorTextColor: 'hsl(222, 47%, 23%)',
      actorLineColor: 'hsl(217, 91%, 60%)',

      // notes
      noteBkgColor: 'rgba(199, 210, 254, 0.35)', // indigo-200 tint
      noteTextColor: 'hsl(222, 47%, 23%)',
      noteBorderColor: 'hsl(220, 14%, 80%)',

      // arrows
      arrowheadColor: 'hsl(217, 91%, 60%)',
      arrowMarkerColor: 'hsl(217, 91%, 60%)',

      // cScales for pies / class colors
      cScale0: 'hsl(217, 91%, 60%)',
      cScale1: 'hsl(199, 89%, 48%)',
      cScale2: 'hsl(174, 72%, 56%)',
      cScale3: 'hsl(262, 83%, 58%)',
      cScale4: 'hsl(142, 70%, 45%)',
      cScale5: 'hsl(24, 95%, 64%)',
      cScale6: 'hsl(334, 73%, 52%)',
      cScale7: 'hsl(271, 91%, 65%)',
      cScale8: 'hsl(0, 84%, 60%)',
      cScale9: 'hsl(45, 93%, 47%)',
    } as const;
  };

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Initialize Mermaid with theme support
    const initMermaid = async () => {
      try {
        // Dynamically import mermaid to ensure it's only loaded on client-side
        const mermaid = (await import('mermaid')).default;
        
        const theme = resolvedTheme === 'dark' ? 'dark' as const : 'default' as const;
        const config: import('mermaid').MermaidConfig = {
          startOnLoad: true,
          theme,
          securityLevel: 'loose' as const,
          fontFamily: 'inherit',
          themeVariables: {
            darkMode: resolvedTheme === 'dark',
            ...getThemeVariables(resolvedTheme === 'dark'),
            fontSize: '14px',
            fontFamily: 'inherit',
          },
        };
        
        mermaid.initialize(config);
        
        // Store mermaid on window for potential debugging
        window.mermaid = mermaid;
        
        // Rerender the diagram after initialization
        renderDiagram();
      } catch (err) {
        console.error('Error initializing mermaid:', err);
      }
    };
    
    initMermaid();
    
    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [resolvedTheme]);

  const renderDiagram = async () => {
    if (!chart) return;
    
    try {
      // Clear previous content
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      // Only proceed if mermaid is available
      if (typeof window === 'undefined' || !window.mermaid) {
        console.warn('Mermaid not available yet');
        return;
      }
      
      // Calculate the width based on viewport width - use 90% of viewport width for mobile, but not more than 1000px
      const maxWidth = Math.min(window.innerWidth * 0.9, 1000);
      
      // Get the current config
      const currentConfig = window.mermaid.mermaidAPI.getConfig();
      
      // Create a new config with updated theme and variables
      const config: import('mermaid').MermaidConfig = {
        ...currentConfig,
        theme: (resolvedTheme === 'dark' ? 'dark' : 'default') as 'dark' | 'default',
        themeVariables: {
          ...(currentConfig.themeVariables || {}),
          ...getThemeVariables(resolvedTheme === 'dark'),
          fontSize: window.innerWidth < 768 ? '12px' : '14px',
        },
      };
      
      // Temporarily override mermaid config
      const originalConfig = { ...window.mermaid.mermaidAPI.getConfig() };
      window.mermaid.mermaidAPI.initialize(config);
      
      // Render the diagram with the current config
      const { svg: renderedSvg } = await window.mermaid.render(
        'mermaid-' + Math.floor(Math.random() * 10000),
        chart
      );
      
      // Restore original config
      window.mermaid.mermaidAPI.initialize(originalConfig);
      
      setSvg(renderedSvg);
      setError('');
    } catch (err) {
      console.error('Error rendering mermaid diagram:', err);
      setError('Error rendering diagram. Try viewing on a larger screen.');
    }
  };

  // Re-render when chart, theme, or window size changes
  useEffect(() => {
    const handleResize = () => {
      renderDiagram();
    };
    
    const timer = setTimeout(() => {
      renderDiagram();
      window.addEventListener('resize', handleResize);
    }, 100); // Small delay to ensure mermaid is initialized
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [chart, resolvedTheme]);

  if (error) {
    return (
      <div className={`mermaid-error bg-red-50 dark:bg-red-900/20 p-4 rounded-md my-4 text-red-600 dark:text-red-400 ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto my-4">
      <div 
        ref={containerRef} 
        className={`mermaid bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-md transition-colors duration-200 inline-block min-w-full ${className}`}
        style={{
          backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
        }}
        dangerouslySetInnerHTML={{ 
          __html: svg ? svg.replace('<svg', '<svg style="max-width: 100%; height: auto;"') : '' 
        }}
      />
    </div>
  );
}
