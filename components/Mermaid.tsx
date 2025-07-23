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
            // Background colors - Using a deep teal base for dark, soft purple for light
            background: resolvedTheme === 'dark' ? 'hsl(192, 70%, 8%)' : 'hsl(260, 60%, 98%)',
            mainBkg: resolvedTheme === 'dark' ? 'hsl(192, 70%, 12%)' : 'hsl(260, 50%, 96%)',
            secondBkg: resolvedTheme === 'dark' ? 'hsl(192, 70%, 16%)' : 'hsl(230, 40%, 84%)',
            
            // Text colors - High contrast for readability
            textColor: resolvedTheme === 'dark' ? 'hsl(180, 30%, 90%)' : 'hsl(260, 70%, 20%)',
            
            // Border and line colors - Distinct but not harsh
            border1: resolvedTheme === 'dark' ? 'hsl(180, 50%, 30%)' : 'hsl(260, 50%, 80%)',
            border2: resolvedTheme === 'dark' ? 'hsl(180, 40%, 35%)' : 'hsl(260, 40%, 85%)',
            lineColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 50%)' : 'hsl(260, 60%, 70%)',
            
            // Sequence diagram specific
            actorBkg: resolvedTheme === 'dark' ? 'hsl(192, 70%, 15%)' : 'hsl(260, 40%, 92%)',
            actorBorder: resolvedTheme === 'dark' ? 'hsl(180, 50%, 40%)' : 'hsl(260, 50%, 75%)',
            actorTextColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 90%)' : 'hsl(260, 70%, 25%)',
            actorLineColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 50%)' : 'hsl(260, 50%, 75%)',
            
            // Node colors - Primary elements
            primaryColor: resolvedTheme === 'dark' ? 'hsl(192, 70%, 20%)' : 'hsl(260, 60%, 90%)',
            primaryTextColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 90%)' : 'hsl(260, 70%, 25%)',
            primaryBorderColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 40%)' : 'hsl(260, 60%, 70%)',
            
            // Secondary colors - Supporting elements
            secondaryColor: resolvedTheme === 'dark' ? 'hsl(192, 50%, 18%)' : 'hsl(260, 30%, 95%)',
            secondaryTextColor: resolvedTheme === 'dark' ? 'hsl(180, 30%, 85%)' : 'hsl(260, 50%, 30%)',
            secondaryBorderColor: resolvedTheme === 'dark' ? 'hsl(180, 40%, 35%)' : 'hsl(260, 40%, 80%)',
            
            // Tertiary colors - Background elements
            tertiaryColor: resolvedTheme === 'dark' ? 'hsl(192, 70%, 10%)' : 'hsl(260, 20%, 97%)',
            tertiaryTextColor: resolvedTheme === 'dark' ? 'hsl(180, 40%, 80%)' : 'hsl(260, 40%, 40%)',
            tertiaryBorderColor: resolvedTheme === 'dark' ? 'hsl(180, 40%, 30%)' : 'hsl(260, 30%, 85%)',
            
            // Note boxes and highlights
            noteBkgColor: resolvedTheme === 'dark' ? 'hsla(180, 50%, 15%, 0.3)' : 'hsla(45, 60%, 70%, 0.7)',
            noteTextColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 90%)' : 'hsl(260, 70%, 25%)',
            noteBorderColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 30%)' : 'hsl(260, 50%, 80%)',
            
            // Font settings
            fontSize: '14px',
            fontFamily: 'inherit',
            
            // Additional sequence diagram styling
            labelBoxBorderColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 40%)' : 'hsl(260, 50%, 80%)',
            labelBoxBkgColor: resolvedTheme === 'dark' ? 'hsl(192, 70%, 12%)' : 'hsl(260, 40%, 96%)',
            labelTextColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 90%)' : 'hsl(260, 70%, 25%)',
            
            // Arrow colors
            arrowheadColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 70%)' : 'hsl(260, 70%, 60%)',
            arrowMarkerColor: resolvedTheme === 'dark' ? 'hsl(180, 50%, 70%)' : 'hsl(260, 70%, 60%)',
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
