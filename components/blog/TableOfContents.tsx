'use client';

import { useState, useEffect } from 'react';
import { slugify } from '@/utils/slugify'; // Assuming a slugify utility exists

interface Heading {
  id: string;
  level: number;
  text: string;
}

const TableOfContents = ({ content }: { content: string }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = Array.from(
      doc.querySelectorAll('h1, h2, h3')
    ) as HTMLElement[];

    const extractedHeadings = headingElements.map((el) => ({
      id: el.id || slugify(el.innerText),
      level: parseInt(el.tagName.substring(1), 10),
      text: el.innerText,
    }));

    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Table of Contents</h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`text-sm ${
                activeId === heading.id
                  ? 'text-primary font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;