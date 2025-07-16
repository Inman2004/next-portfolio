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

// Use a function to get the site config that can handle both server and client side
export function getSiteConfig(): SiteConfig {
  const siteUrl = 
    typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://rvimmandev.vercel.app';

  return {
    name: 'Rv Imman | Blog',
    url: siteUrl,
    description: 'Personal blog of Rv Imman - Full Stack Developer',
    themeColor: '#000000',
    author: {
      name: 'Rv Imman',
      twitter: 'rvimman',
    },
    socials: {
      twitter: 'https://twitter.com/rvimman',
      github: 'https://github.com/Inman2004',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'Rv Imman | Blog',
    },
  };
}

export const SITE_CONFIG = getSiteConfig();
