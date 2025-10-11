'use client'

import React from 'react';
import AdComponent from './AdComponent';
import MarkdownViewer from '../blog/MarkdownViewer';

interface AdInjectorProps {
  content: string;
}

const AdInjector: React.FC<AdInjectorProps> = ({ content }) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);

  const injectAds = () => {
    if (readingTime < 2) {
      return <MarkdownViewer content={content} />;
    }

    const paragraphs = content.split('\n\n');
    let adCount = 0;

    if (readingTime >= 2 && readingTime <= 5) {
      adCount = 2;
    } else if (readingTime > 5) {
      adCount = 3;
    }

    if (adCount === 0) {
      return <MarkdownViewer content={content} />;
    }

    const totalParagraphs = paragraphs.length;
    const adPositions = [];
    for (let i = 1; i <= adCount; i++) {
        const position = Math.floor((totalParagraphs / (adCount + 1)) * i);
        if(position > 0 && position < totalParagraphs -1)
            adPositions.push(position);
    }

    let contentWithAds: React.ReactNode[] = [];
    let lastIndex = 0;

    adPositions.forEach((pos, index) => {
      contentWithAds.push(<MarkdownViewer key={`content-${index}`} content={paragraphs.slice(lastIndex, pos).join('\n\n')} />);
      contentWithAds.push(<AdComponent key={`ad-${index}`} />);
      lastIndex = pos;
    });

    contentWithAds.push(<MarkdownViewer key="content-last" content={paragraphs.slice(lastIndex).join('\n\n')} />);

    return <>{contentWithAds}</>;
  };

  return <>{injectAds()}</>;
};

export default AdInjector;
