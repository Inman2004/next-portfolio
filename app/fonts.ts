import { Pacifico, Tangerine, Sacramento } from 'next/font/google';

export const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});

// Replacing StoicScript with Tangerine as a similar elegant script font
export const elegantScript = Tangerine({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-elegant-script',
  display: 'swap',
});

// Adding an additional decorative font option
export const decorativeScript = Sacramento({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-decorative-script',
  display: 'swap',
});
