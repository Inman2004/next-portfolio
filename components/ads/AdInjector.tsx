'use client'

import React from 'react';
import AdComponent from './AdComponent';
import HtmlRenderer from '../blog/HtmlRenderer';
import { parse } from 'node-html-parser';

interface AdInjectorProps {
  content: string;
}

const AdInjector: React.FC<AdInjectorProps> = ({ content }) => {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);

  const injectAds = () => {
    if (readingTime < 2) {
      return <HtmlRenderer content={content} />;
    }

    const root = parse(content);
    const paragraphs = root.querySelectorAll('p');
    let adCount = 0;

    if (readingTime >= 2 && readingTime <= 5) {
      adCount = 2;
    } else if (readingTime > 5) {
      adCount = 3;
    }

    if (adCount === 0) {
      return <HtmlRenderer content={content} />;
    }

    const totalParagraphs = paragraphs.length;
    const adPositions = [];
    for (let i = 1; i <= adCount; i++) {
      const position = Math.floor((totalParagraphs / (adCount + 1)) * i);
      if (position > 0 && position < totalParagraphs - 1) {
        adPositions.push(position);
      }
    }

    const contentNodes: React.ReactNode[] = [];
    let lastIndex = 0;

    adPositions.forEach((pos, index) => {
      const contentSlice = paragraphs.slice(lastIndex, pos).map(p => p.outerHTML).join('');
      contentNodes.push(<HtmlRenderer key={`content-${index}`} content={contentSlice} />);
      contentNodes.push(<AdComponent key={`ad-${index}`} />);
      lastIndex = pos;
    });

    const lastContentSlice = paragraphs.slice(lastIndex).map(p => p.outerHTML).join('');
    contentNodes.push(<HtmlRenderer key="content-last" content={lastContentSlice} />);

    return <>{contentNodes}</>;
  };

  return <>{injectAds()}</>;
};

export default AdInjector;
