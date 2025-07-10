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
  name: 'blog',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rvimmandev.vercel.app',
  description: 'A modern blog with great content',
  themeColor: '#ffffff',
  author: {
    name: 'rvimman',
    twitter: '@rvimman_',
  },
  socials: {
    twitter: 'https://twitter.com/rvimman_',
    github: 'https://github.com/Inman2004',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Blog Name',
  },
};
