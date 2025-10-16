'use client'

import React from 'react';
import AdComponent from './AdComponent';

interface AdInjectorProps {
  content: string;
}

const AdInjector: React.FC<AdInjectorProps> = ({ content }) => {
  // Since the content is now HTML, we can render it directly.
  // The ad injection logic needs to be re-evaluated for HTML content.
  // For now, we will just render the content with a placeholder for ad injection.
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

export default AdInjector;
