import { Metadata, ResolvingMetadata } from 'next';
import { getServerBlogPost, getServerUserData } from '@/lib/server-blog-utils';
import { SITE_CONFIG } from '@/config/site';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

type Author = {
  name: string;
  twitter?: string;
  [key: string]: any;
};

type BlogPostWithAuthor = {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  authorId?: string;
  author?: string | Author;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  coverImage?: string;
  tags?: string[] | string;
  category?: string;
  categories?: string[];
  [key: string]: any;
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
    // Get the post data using server-side function
    const postData = await getServerBlogPost(params.id) as BlogPostWithAuthor | null;
    
    if (!postData) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
        robots: 'noindex, nofollow',
      };
    }
    
    // Get author data if available
    let authorData = null;
    if (postData.authorId) {
      authorData = await getServerUserData(postData.authorId);
    }

    // Get the previous metadata (from parent)
    const previousImages = (await parent).openGraph?.images || [];
    
    // Process post data
    const title = postData.title || 'Untitled Post';
    const excerpt = postData.excerpt || '';
    const content = postData.content || '';
    const description = excerpt || (content ? `${content.substring(0, 155).trim()}...` : 'Read this blog post');
    
    // Handle author data
    let authorName = authorData?.name || SITE_CONFIG.author.name;
    let authorTwitter = authorData?.twitter?.replace('@', '') || SITE_CONFIG.author.twitter?.replace('@', '') || '';
    
    // Fallback to post author if available
    if (!authorName && postData.author) {
      if (typeof postData.author === 'string') {
        authorName = postData.author;
      } else {
        const author = postData.author as Author;
        if (author.name) {
          authorName = author.name;
          if (author.twitter) {
            authorTwitter = String(author.twitter).replace('@', '');
          }
        }
      }
    }
    
    // Handle dates with proper validation
    const getValidDate = (dateValue: Date | string | undefined): Date => {
      if (!dateValue) return new Date();
      
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? new Date() : date;
    };
    
    const publishedDate = getValidDate(postData.createdAt);
    const updatedDate = getValidDate(postData.updatedAt);
    
    const publishedTime = publishedDate.toISOString();
    const modifiedTime = (postData.updatedAt && postData.updatedAt !== postData.createdAt)
      ? updatedDate.toISOString()
      : publishedTime;
    
    // Handle images with better defaults and multiple sizes
    const defaultImage = new URL('/images/og-default.jpg', SITE_CONFIG.url).toString();
    let imageUrl = defaultImage;
    
    // If there's a cover image, use it
    if (postData.coverImage) {
      try {
        // If it's already a full URL, use it directly
        if (postData.coverImage.startsWith('http')) {
          imageUrl = postData.coverImage;
        } else {
          // Otherwise, prepend the site URL
          imageUrl = new URL(postData.coverImage.startsWith('/') 
            ? postData.coverImage 
            : `/${postData.coverImage}`, SITE_CONFIG.url).toString();
        }
      } catch (e) {
        console.warn('Invalid cover image URL:', postData.coverImage);
      }
    }
    
    // Generate canonical URL
    const url = new URL(`/blog/${params.id}`, SITE_CONFIG.url).toString();
    
    // Process tags
    const tags = postData.tags || [];
    const tagList = Array.isArray(tags) 
      ? tags.slice(0, 10).map(String) 
      : String(tags).split(',').map(t => t.trim()).filter(Boolean).slice(0, 10);
    
    // Get category
    const category = postData.category || 
      (Array.isArray(postData.categories) && postData.categories.length > 0 
        ? String(postData.categories[0])
        : 'General');

    return {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      applicationName: SITE_CONFIG.name,
      authors: [{ 
        name: authorName,
        url: new URL(`/author/${authorName.toLowerCase().replace(/\s+/g, '-')}`, SITE_CONFIG.url).toString()
      }],
      keywords: tagList.length ? tagList : undefined,
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
        title: title,
        description: description || `${title} - ${SITE_CONFIG.name}`,
        type: 'article',
        publishedTime,
        modifiedTime,
        url,
        locale: 'en_US',
        siteName: SITE_CONFIG.name,
        authors: [authorName],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/jpeg',
            secureUrl: imageUrl,
          },
          // Additional image sizes for different platforms
          {
            url: imageUrl,
            width: 800,
            height: 418,
            alt: title,
            type: 'image/jpeg',
          },
          {
            url: imageUrl,
            width: 600,
            height: 314,
            alt: title,
            type: 'image/jpeg',
          },
          ...(previousImages as any[]),
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description || `${title} - ${SITE_CONFIG.name}`,
        images: [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }],
        creator: authorTwitter ? `@${authorTwitter}` : undefined,
        site: SITE_CONFIG.author.twitter ? `@${SITE_CONFIG.author.twitter.replace('@', '')}` : undefined,
      },
      // Robots configuration
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
        'article:section': category || 'General',
        ...(tagList.length > 0 ? { 'article:tag': tagList } : {}),
        
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
        'og:site_name': SITE_CONFIG.name,
        'og:locale': 'en_US',
        
        // Additional meta for other platforms
        'pinterest-rich-pin': 'true',
        'pinterest-rich-pin:title': title,
        'pinterest-rich-pin:description': description,
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

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
