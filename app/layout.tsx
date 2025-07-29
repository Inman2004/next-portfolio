import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { PageLoadingProvider } from "@/components/providers/page-loading-provider";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import { elegantScript, pacifico } from './fonts';
import WelcomePopup from '@/components/WelcomePopupClient';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { FontLoader } from '@/components/FontLoader';
import { BottomNav } from "@/components/BottomNav";
import { Toaster } from 'react-hot-toast';

// Base URL for the site
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rvinman2004.vercel.app/';

// Default metadata
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Rv Imman',
    template: '%s | Rv Imman',
  },
  description: 'Portfolio of rv imman - Full Stack Developer specializing in modern web technologies. Check out my projects and get in touch!',
  keywords: [
    'rv imman',
    'Full Stack Developer',
    'Web Developer',
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'Portfolio',
    'Frontend Developer',
    'Backend Developer',
  ],
  authors: [{ name: 'rv imman' }],
  creator: 'rv imman',
  publisher: 'rv imman',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'rv imman',
    title: 'rv imman | Full Stack Developer',
    description: 'Portfolio of rv imman - Full Stack Developer specializing in modern web technologies.',
    images: [
      {
        url: `${baseUrl}/images/web ui.png`,
        width: 1200,
        height: 630,
        alt: 'rv imman - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'rv imman | Full Stack Developer',
    description: 'Portfolio of rv imman - Full Stack Developer specializing in modern web technologies.',
    images: [`${baseUrl}/images/web ui.png`],
    creator: '@rvimman',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "mPfU4gmz2hZbYQTnwbs8gbWsMCbLtWzzZ6l1uSqatAQ",
  },
  icons: {
    icon: "/favicon.png",
  },
  other: {
    'google-adsense-account': 'ca-pub-6373066383987878'
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// Optimize font loading with display: 'swap' and preload
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

// Livvic font removed as it wasn't properly imported

// Add JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'rv imman',
  url: baseUrl,
  sameAs: [
    'https://github.com/rvinman2004',
    'https://linkedin.com/in/rv3d',
    'https://twitter.com/rvimman_',
  ],
  jobTitle: 'Full Stack Developer',
  worksFor: {
    '@type': 'Organization',
    name: 'Freelance',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${geistSans.variable} ${geistMono.variable} ${elegantScript.variable} ${pacifico.variable}`}
      suppressHydrationWarning={true}
    >
      <head>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6373066383987878"
     crossOrigin="anonymous"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Check for saved theme preference or use system preference
                  const savedTheme = localStorage.getItem('theme');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  let theme = savedTheme || 'system';
                  
                  // If theme is system, use system preference
                  if (theme === 'system') {
                    theme = systemPrefersDark ? 'dark' : 'light';
                  }
                  
                  // Apply the theme class immediately to prevent flash of default theme
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                  
                  // Store the resolved theme
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  console.error('Error setting theme:', e);
                }
              })();
            `,
          }}
        />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources */}
        <link rel="preload" as="image" href="/favicon.png" />
        <link 
          rel="preload" 
          as="image" 
          href="/images/avatar1.png"
          fetchPriority="high"
        />
        
        {/* Add preload for critical images here */}
      </head>
      <body 
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${elegantScript.variable} font-sans antialiased min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <PageLoadingProvider>
          <Providers>
            <ErrorBoundary>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow" id="main-content">
                  {children}
                </main>
                <BottomNav />
              </div>
              <WelcomePopup />
              <PerformanceMonitor />
              <FontLoader />
              <Toaster position="top-center" />
            </ErrorBoundary>
          </Providers>
        </PageLoadingProvider>
      </body>
    </html>
  );
}
