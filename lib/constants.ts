import { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'My Portfolio',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  title: 'My Portfolio | Web Developer & Designer',
  description: 'Personal portfolio showcasing my projects, skills, and blog posts about web development and design.',
  author: {
    name: 'Your Name',
    twitter: 'yourtwitter', // Without @
    github: 'yourgithub',
    linkedin: 'yourlinkedin',
  },
  themeColor: '#ffffff',
  defaultImage: '/images/og-default.jpg',
};

export const DEFAULT_METADATA: Metadata = {
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: new URL(SITE_CONFIG.defaultImage, SITE_CONFIG.url).toString(),
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.author.twitter ? `@${SITE_CONFIG.author.twitter}` : undefined,
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: '', // Add Google Search Console verification code
  },
};

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    href: `https://github.com/${SITE_CONFIG.author.github}`,
    icon: 'github',
  },
  {
    name: 'Twitter',
    href: `https://twitter.com/${SITE_CONFIG.author.twitter}`,
    icon: 'twitter',
  },
  {
    name: 'LinkedIn',
    href: `https://linkedin.com/in/${SITE_CONFIG.author.linkedin}`,
    icon: 'linkedin',
  },
];
