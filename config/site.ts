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
  name: 'Your Blog Name',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  description: 'A modern blog with great content',
  themeColor: '#ffffff',
  author: {
    name: 'Your Name',
    twitter: '@yourtwitter',
  },
  socials: {
    twitter: 'https://twitter.com/yourtwitter',
    github: 'https://github.com/yourusername',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Your Blog Name',
  },
};
