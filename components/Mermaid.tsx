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
            background: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
            primaryColor: resolvedTheme === 'dark' ? '#1e40af' : '#3b82f6',
            secondaryColor: resolvedTheme === 'dark' ? '#1e3a8a' : '#bfdbfe',
            tertiaryColor: resolvedTheme === 'dark' ? '#1e1b4b' : '#dbeafe',
            primaryBorderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
            lineColor: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280',
            textColor: resolvedTheme === 'dark' ? '#e5e7eb' : '#1f2937',
            fontSize: '14px',
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
