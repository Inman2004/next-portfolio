'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { generateHeadingId } from '@/lib/markdownUtils';

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
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 100; // Adjust this value based on your header height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

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
        id: generateHeadingId(heading.text), // Use the same ID generation as in MarkdownViewer
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

  // Extract headings from markdown content, excluding code blocks and inline code
  useEffect(() => {
    // First, remove all code blocks (```code```) from the content
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');
    // Then remove all inline code (`code`) from the content
    const contentWithoutCode = contentWithoutCodeBlocks.replace(/`[^`]+`/g, '');
    
    // This regex matches markdown headings (## Heading) and captures the level and text
    const regex = /^(#{1,6})\s+(.+)$/gm;
    const matches = Array.from(contentWithoutCode.matchAll(regex));
    
    const flatHeadings = matches
      .map((match) => {
        const level = match[1].length; // Number of # characters (1-6)
        let text = match[2].trim();
        
        // Skip if the text is empty after trimming
        if (!text) return null;
        
        // Clean up the text (remove markdown formatting, links, etc.)
        text = text
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links [text](url) -> text
          .replace(/<[^>]*>?/gm, '') // Remove HTML tags
          .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold**
          .replace(/\*([^*]+)\*/g, '$1') // Remove *italic*
          .trim();
        
        if (!text) return null;
        
        // Generate the ID using the same function as in MarkdownViewer
        const id = generateHeadingId(text);
        
        return { id, text, level };
      })
      .filter(Boolean) as {id: string, text: string, level: number}[];
    
    // Build the hierarchical structure
    const headingTree = buildHeadingTree(flatHeadings);
    setHeadings(headingTree);
  }, [content]);

  // Set active heading based on scroll position
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%', threshold: 0.1 }
    );

    // Observe all headings
    const elements = headings.map(({ id }) => document.getElementById(id));
    elements.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className={cn('sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-900 dark:border-gray-700', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        Table of Contents
      </h3>
      <nav className="border-l-2 border-gray-200 dark:border-gray-700">
        <TocList 
          nodes={headings} 
          activeId={activeId}
          setActiveId={setActiveId}
          className="space-y-1"
        />
      </nav>
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
          <button
            onClick={(e) => {
              e.preventDefault();
              const targetId = node.id;
              // Update the URL hash without scrolling
              window.history.pushState({}, '', `#${targetId}`);
              // Smooth scroll to the target
              scrollToElement(targetId);
              // Set active ID immediately for better UX
              setActiveId(targetId);
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
          </button>
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
