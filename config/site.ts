interface SiteConfig {
  name: string;
  url: string;
  description: string;
  themeColor: string;
  author: {
    name: string;
    twitter: string;
    [key: string]: any;
  };
  socials: {
    twitter: string;
    github: string;
    [key: string]: string | undefined;
  };
  openGraph: {
    type: string;
    locale: string;
    siteName: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export const SITE_CONFIG: SiteConfig = {
  name: 'Rv Imman | Blog',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rvimmandev.vercel.app',
  description: 'Personal blog of Rv Imman - Full Stack Developer',
  themeColor: '#ffffff',
  author: {
    name: 'Rv Imman',
    twitter: 'rvimman_',
  },
  socials: {
    twitter: 'https://twitter.com/rvimman_',
    github: 'https://github.com/Inman2004',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Rv Imman | Blog',
  },
};
