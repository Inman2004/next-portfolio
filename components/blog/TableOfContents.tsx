'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { createHeadingIdGenerator } from '@/lib/markdownUtils';

interface HeadingNode {
  id: string;
  text: string;
  level: number;
  children: HeadingNode[];
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

// Smooth scroll to element with offset for fixed header
const scrollToElement = (id: string) => {
  // First try with the exact ID
  let element = document.getElementById(id);
  
  // If not found, try with the base ID (without -number suffix)
  if (!element) {
    const baseId = id.replace(/-\d+$/, '');
    element = document.getElementById(baseId);
  }
  
  if (element) {
    const headerOffset = 100; // Adjust this value based on your header height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    // Update URL without page reload
    window.history.pushState({}, '', `#${id}`);
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingNode[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Build a tree structure from flat headings array
  const buildHeadingTree = (headings: {id: string, text: string, level: number}[]): HeadingNode[] => {
    const root: HeadingNode = { id: '', text: 'Root', level: 0, children: [] };
    const stack: HeadingNode[] = [root];
    
    for (const heading of headings) {
      const node: HeadingNode = {
        id: heading.id,
        text: heading.text,
        level: heading.level,
        children: []
      };
      
      // Find the appropriate parent in the stack
      while (stack.length > 1 && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }
      
      // Add the node as a child of the current parent
      stack[stack.length - 1].children.push(node);
      
      // Push the node onto the stack to be a potential parent
      stack.push(node);
    }
    
    return root.children;
  };

  // Build TOC from the rendered DOM to guarantee IDs/text match
  useEffect(() => {
    let cancelled = false;
    const regenIds = createHeadingIdGenerator();
    const selector = '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6';

    const scan = () => {
      if (cancelled) return;
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      if (!elements.length) {
        setHeadings([]);
        return;
      }
      const flat = elements.map((el) => {
        const level = Number(el.tagName.substring(1)) || 1;
        const text = (el.textContent || '').trim();
        let id = el.id;
        if (!id) {
          id = regenIds(text);
          el.id = id;
        }
        return { id, text, level };
      });
      const tree = buildHeadingTree(flat);
      if (!cancelled) setHeadings(tree);
    };

    // Wait until after Markdown renders/hydrates
    const raf = requestAnimationFrame(() => setTimeout(scan, 0));

    // Observe DOM changes under the article to keep TOC in sync
    const container = document.querySelector('.prose');
    let observer: MutationObserver | null = null;
    if (container) {
      observer = new MutationObserver(() => scan());
      observer.observe(container, { childList: true, subtree: true, characterData: true });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [content]);

  // Helper: flatten the heading tree to a list of IDs
  const flattenIds = (nodes: HeadingNode[]): string[] => {
    const ids: string[] = [];
    const stack: HeadingNode[] = [...nodes];
    while (stack.length) {
      const node = stack.shift()!;
      ids.push(node.id);
      if (node.children?.length) {
        stack.unshift(...node.children);
      }
    }
    return ids;
  };

  // Set active heading using Intersection Observer
  useEffect(() => {
    if (headings.length === 0) return;

    const headerHeight = 100; // Adjust based on your header height
    const observerOptions = {
      root: null, // viewport
      rootMargin: `-${headerHeight}px 0px -70% 0px`, // Adjust the bottom margin to control when headings become active
      threshold: 0.1
    };

    const idsToObserve = flattenIds(headings);
    const headingElements = idsToObserve
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      // Find the first entry that's intersecting (visible in the viewport)
      const visibleEntry = entries.find(entry => entry.isIntersecting);
      
      if (visibleEntry) {
        setActiveId(visibleEntry.target.id);
      } else if (window.scrollY < 100) {
        // If we're at the top of the page, set the first heading as active
        setActiveId(headingElements[0]?.id || '');
      }
    }, observerOptions);

    // Observe all headings
    headingElements.forEach((element) => observer.observe(element));

    // Initial check for headings in view
    const checkInitialActive = () => {
      const firstVisible = headingElements.find(el => {
        const rect = el.getBoundingClientRect();
        return rect.top >= headerHeight && rect.bottom <= window.innerHeight;
      });
      
      if (firstVisible) {
        setActiveId(firstVisible.id);
      } else if (window.scrollY < 100) {
        setActiveId(headingElements[0]?.id || '');
      }
    };

    // Run initial check after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(checkInitialActive, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [headings]);

  // Memoize the TOC content to prevent unnecessary re-renders
  const tocContent = useMemo(() => {
    if (headings.length === 0) return null;
    
    return (
      <nav className="border-l-2 border-gray-200 dark:border-gray-700">
        <TocList 
          nodes={headings} 
          activeId={activeId}
          setActiveId={setActiveId}
          className="space-y-1"
        />
      </nav>
    );
  }, [headings, activeId]);
  
  if (headings.length === 0) return null;

  return (
    <div className={cn('sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-900/50 dark:border-gray-700', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        Table of Contents
      </h3>
      {tocContent}
    </div>
  );
}

interface TocListProps {
  nodes: HeadingNode[];
  activeId: string | null;
  className?: string;
  level?: number;
}

const TocList = ({ nodes, activeId, className = '', level = 0, setActiveId }: TocListProps & { setActiveId: (id: string) => void }) => {
  if (!nodes.length) return null;
  
  return (
    <ul className={cn('space-y-1', className)}>
      {nodes.map((node) => (
        <li key={node.id} className="">
          <a
            href={`#${node.id}`}
            onClick={() => {
              const targetId = node.id;
              // Set active ID immediately for instant feedback
              setActiveId(targetId);
              // Allow default hash change, then correct for header offset
              setTimeout(() => scrollToElement(targetId), 0);
            }}
            className={cn(
              'group flex items-center py-1.5 text-sm transition-all duration-200 w-full text-left',
              'relative rounded dark:hover:bg-accent/10 hover:bg-gray-900/10 px-3 -ml-2',
              'border-l-2 cursor-pointer',
              {
                // Base styles for all levels
                'pl-4': level === 0,
                'pl-6': level === 1,
                'pl-8': level === 2,
                'pl-10': level >= 3,
                // Active state
                'scale-[1.02] font-medium': activeId === node.id,
                // Color variations based on level
                'border-l-indigo-500 text-indigo-700/80 dark:text-indigo-200/80 font-bold hover:text-indigo-700 dark:hover:text-indigo-200': level === 0,
                'border-l-blue-500 text-blue-700/70 dark:text-blue-200/60 hover:text-blue-700 dark:hover:text-blue-200': level === 1,
                'border-l-teal-500 text-teal-950/60 dark:text-teal-700 hover:text-teal-700 dark:hover:text-teal-200': level === 2,
                'border-l-purple-500 text-purple-600/50 dark:text-purple-300/50 hover:text-purple-700 dark:hover:text-purple-200': level >= 3,
                // Active state colors
                '!text-indigo-700 dark:!text-indigo-200 !border-l-indigo-700 dark:!border-l-indigo-300': activeId === node.id && level === 0,
                '!text-blue-700 dark:!text-blue-200 !border-l-blue-700 dark:!border-l-blue-300': activeId === node.id && level === 1,
                '!text-teal-700 dark:!text-teal-200 !border-l-teal-700 dark:!border-l-teal-300': activeId === node.id && level === 2,
                '!text-purple-700 dark:!text-purple-200 !border-l-purple-700 dark:!border-l-purple-300': activeId === node.id && level >= 3,
              }
            )}
            style={{
              paddingLeft: `${Math.min(level * 0.5 + 0.75, 3)}rem`,
            }}
            >
            <ChevronRight
              className={cn(
                'h-3 w-3 mr-2 flex-shrink-0 transition-transform',
                activeId === node.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                activeId === node.id ? 'scale-100' : 'scale-0 group-hover:scale-100'
              )}
            />
            <span className="truncate">{node.text}</span>
          </a>
          {node.children.length > 0 && (
            <TocList 
              nodes={node.children} 
              activeId={activeId}
              setActiveId={setActiveId}
              level={level + 1}
              className="mt-1"
            />
          )}
        </li>
      ))}
    </ul>
  );
};
