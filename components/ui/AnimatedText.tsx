'use client';

import { MorphingText } from "@/components/magicui/morphing-text";

interface AnimatedTextProps {
  texts: string[];
  className?: string;
}

export function AnimatedText({ texts, className = '' }: AnimatedTextProps) {
  return (
    <div className={className}>
      <MorphingText 
        texts={texts}
        className="inline-block"
      />
    </div>
  );
}
