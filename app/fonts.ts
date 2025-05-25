import localFont from 'next/font/local';

export const stoicScript = localFont({
  src: [
    {
      path: '../public/fonts/StoicScript.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-stoic-script',
  display: 'swap',
});
