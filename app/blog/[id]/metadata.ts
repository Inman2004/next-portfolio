import { Metadata, ResolvingMetadata } from 'next';
import { getBlogPost } from '@/lib/blogUtils';
import { SITE_CONFIG } from '@/config/site';
import type { BlogPost } from '@/types/blog';

// Extended type to include the user property from getBlogPost
type BlogPostWithUser = BlogPost & { user?: any };

// Type guard for checking if a value is an Author object
interface Author {
  name: string;
  twitter?: string;
  [key: string]: unknown;
}

const isAuthor = (author: unknown): author is Author => {
  return (
    typeof author === 'object' && 
    author !== null && 
    'name' in author && 
    typeof (author as { name: unknown }).name === 'string'
  );
};

// Helper to safely get string value from unknown
function getStringValue(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return defaultValue;
  return String(value).trim();
}

// Process tags with type safety
const processTags = (tags: unknown): string[] => {
  if (!tags) return [];
  
  if (Array.isArray(tags)) {
    return tags
      .map(tag => getStringValue(tag))
      .filter(Boolean)
      .slice(0, 10);
  }
  
  if (typeof tags === 'string') {
    const parsed = tags.split(',').map(t => t.trim()).filter(Boolean);
    return parsed.slice(0, 10);
  }
  
  return [];
};

// Type definitions for the component props
type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Ensure we have a valid post ID
  if (!params?.id) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
      robots: 'noindex, nofollow',
    };
  }
  try {
    const postData = await getBlogPost(params.id);
    
    // Handle case where post is not found
    if (!postData) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
        robots: 'noindex, nofollow',
        openGraph: { 
          title: 'Post Not Found', 
          description: 'The requested blog post could not be found.' 
        },
        twitter: { 
          card: 'summary', 
          title: 'Post Not Found', 
          description: 'The requested blog post could not be found.' 
        },
      };
    }
    
    // Get the previous metadata (from parent)
    const previousImages = (await parent).openGraph?.images || [];
    
    // Process post data safely with utility functions
    const title = getStringValue((postData as any).title, 'Untitled Post').substring(0, 100);
    const excerpt = getStringValue((postData as any).excerpt);
    const content = getStringValue((postData as any).content);
    const description = (excerpt || (content ? `${content.substring(0, 155).trim()}...` : 'Read this blog post')).substring(0, 300);
    
    // Handle author data
    let authorName = SITE_CONFIG.author.name;
    let authorTwitter = SITE_CONFIG.author.twitter.replace('@', '');
    
    // Safely access user and author data
    const user = (postData as any).user;
    const author = (postData as any).author;
    
    // Check for user data first (from getBlogPost)
    if (user) {
      authorName = getStringValue(user.name, authorName);
      const twitter = getStringValue(user.twitter);
      if (twitter) authorTwitter = twitter.replace('@', '');
    } 
    // Fall back to author field
    else if (author) {
      if (typeof author === 'string') {
        authorName = author;
      } else if (isAuthor(author)) {
        authorName = author.name;
        if (author.twitter) {
          authorTwitter = String(author.twitter).replace('@', '');
        }
      }
    }
    
    // Handle dates
    const publishedTime = (postData as any).createdAt 
      ? new Date((postData as any).createdAt).toISOString() 
      : new Date().toISOString();
      
    const modifiedTime = ((postData as any).updatedAt && (postData as any).updatedAt !== (postData as any).createdAt)
      ? new Date((postData as any).updatedAt).toISOString() 
      : publishedTime;
    
    // Handle images
    const defaultImage = new URL('/default-og-image.jpg', SITE_CONFIG.url).toString();
    const imageUrl = (postData as any).coverImage 
      ? new URL((postData as any).coverImage, SITE_CONFIG.url).toString()
      : defaultImage;
    
    // Generate canonical URL
    const url = new URL(`/blog/${params.id}`, SITE_CONFIG.url).toString();
    
    // Process tags
    const tags = processTags((postData as any).tags);
    
    // Get category
    const category = (
      getStringValue((postData as any).category) ||
      (Array.isArray((postData as any).categories) && (postData as any).categories.length > 0 
        ? getStringValue((postData as any).categories[0]) 
        : 'General')
    ) || 'General';



    // Generate metadata
    return {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      applicationName: SITE_CONFIG.name,
      authors: [{ 
        name: authorName,
        url: new URL(`/author/${authorName.toLowerCase().replace(/\s+/g, '-')}`, SITE_CONFIG.url).toString()
      }],
      keywords: tags.length ? tags : undefined,
      creator: authorName,
      publisher: SITE_CONFIG.name,
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(SITE_CONFIG.url),
      alternates: {
        canonical: url,
        languages: {
          'en-US': url,
        },
      },
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime,
        modifiedTime,
        url,
        locale: 'en_US',
        siteName: SITE_CONFIG.name,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/jpeg',
            secureUrl: imageUrl,
          },
          ...(previousImages.length > 0 ? previousImages : []),
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }],
        creator: `@${authorTwitter}`,
        site: `@${SITE_CONFIG.author.twitter.replace('@', '')}`,
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
      other: {
        // Article structured data
        'article:published_time': publishedTime,
        'article:modified_time': modifiedTime,
        'article:author': authorName,
        'article:section': category,
        ...(tags.length > 0 ? { 'article:tag': tags } : {}),
        
        // Additional meta tags
        'theme-color': SITE_CONFIG.themeColor,
        'msapplication-TileColor': SITE_CONFIG.themeColor,
        'msapplication-config': '/browserconfig.xml',
        'apple-mobile-web-app-title': SITE_CONFIG.name,
        'application-name': SITE_CONFIG.name,
        
        // Additional OpenGraph tags
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
        'og:image:type': 'image/jpeg',
        
        // Twitter card
        'twitter:image:alt': title,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading this page.',
      robots: 'noindex, nofollow',
      openGraph: {
        title: 'Error',
        description: 'An error occurred while loading this page.',
      },
      twitter: {
        card: 'summary',
        title: 'Error',
        description: 'An error occurred while loading this page.',
      },
    };
  }
}