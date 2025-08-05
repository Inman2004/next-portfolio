'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { generateHeadingId, resetHeadingCounter } from '@/lib/markdownUtils';

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

  // Extract headings from markdown content, excluding code blocks and inline code
  useEffect(() => {
    // Reset the heading counter before processing a new document
    resetHeadingCounter();
    
    // First, remove all code blocks (```code```) from the content
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');
    // Then remove all inline code (`code`) from the content
    const contentWithoutCode = contentWithoutCodeBlocks.replace(/`[^`]+`/g, '');
    
    const regex = /^(#{1,6})\s+(.+)$/gm; // Support up to h6
    const matches = Array.from(contentWithoutCode.matchAll(regex));
    
    const flatHeadings = matches
      .map((match) => {
        const level = match[1].length; // Number of # characters
        let text = match[2].trim();
        
        // Skip if the text is empty after trimming
        text = text.trim();
        if (!text) return null;
        
        // Use the shared utility function to generate consistent IDs
        const id = generateHeadingId(text);
          
        return { id, text, level };
      })
      .filter(Boolean) as {id: string, text: string, level: number}[]; // Filter out any null entries
    
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
    <div className={cn('sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4', className)}>
      <div className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">
        Table of Contents
      </div>
      <nav className="border-l-2 border-primary/20">
        <TocList 
          nodes={headings} 
          activeId={activeId} 
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

const TocList = ({ nodes, activeId, className = '', level = 0 }: TocListProps) => {
  if (!nodes.length) return null;
  
  return (
    <ul className={cn('space-y-1', className)}>
      {nodes.map((node) => (
        <li key={node.id} className="">
          <a
            href={`#${node.id}`}
            className={cn(
              'group flex items-center py-1.5 text-sm transition-all duration-200',
              'relative rounded-lg dark:hover:bg-accent/10 hover:bg-gray-900/10 px-3 -ml-2',
              'border-l-2',
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
              level={level + 1}
              className="mt-1"
            />
          )}
        </li>
      ))}
    </ul>
  );
};
