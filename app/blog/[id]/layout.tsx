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
    
    // Process post data with better defaults
    const title = postData.title?.trim() || 'Untitled Post';
    const excerpt = postData.excerpt?.trim() || '';
    const content = postData.content || '';
    
    // Process author name with type safety - prioritize the blog post's uploaded user
    const getAuthorName = (): string => {
      // First check for the user who uploaded the post
      if (postData.user?.displayName) {
        return postData.user.displayName;
      }
      if (postData.user?.name) {
        return postData.user.name;
      }
      
      // Fall back to post author data if user data is not available
      if (typeof postData.author === 'string') {
        return postData.author;
      }
      if (postData.author?.displayName) {
        return postData.author.displayName;
      }
      if (postData.author?.name) {
        return postData.author.name;
      }
      
      // Final fallback to site config
      return SITE_CONFIG.author.name;
    };

    const authorName = getAuthorName();

    // Process Twitter handle with type safety - prioritize the blog post's uploaded user
    const getAuthorTwitter = (): string => {
      // First check for the user who uploaded the post
      if (postData.user?.twitter) {
        return postData.user.twitter.replace(/^@/, '');
      }
      
      // Fall back to post author data if user data is not available
      if (typeof postData.author === 'object' && postData.author?.twitter) {
        return postData.author.twitter.replace(/^@/, '');
      }
      
      // Final fallback to site config
      return SITE_CONFIG.author.twitter.replace(/^@/, '');
    };

    const authorTwitter = getAuthorTwitter();
    
    // Generate description from content or excerpt
    const generateDescription = (postContent: string, postExcerpt: string, postTitle: string, postAuthorName: string): string => {
      if (postExcerpt) return postExcerpt;
      if (!postContent) return `Read "${postTitle}" by ${postAuthorName} on ${SITE_CONFIG.name}`;
      
      return postContent
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 157) + '...';
    };
    
    // Generate the description once and reuse it
    const description = generateDescription(content, excerpt, title, authorName);
    
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
          imageUrl = new URL(
            postData.coverImage.startsWith('/') 
              ? postData.coverImage 
              : `/${postData.coverImage}`, 
            SITE_CONFIG.url
          ).toString();
        }
      } catch (e) {
        console.warn('Invalid cover image URL:', postData.coverImage);
      }
    } else {
      // If no cover image, use a default with title and author
      const defaultImageUrl = new URL('/api/og', SITE_CONFIG.url);
      defaultImageUrl.searchParams.set('title', title);
      defaultImageUrl.searchParams.set('author', authorName);
      if (postData.tags && Array.isArray(postData.tags) && postData.tags.length > 0) {
        defaultImageUrl.searchParams.set('tags', postData.tags.join(','));
      } else if (typeof postData.tags === 'string') {
        defaultImageUrl.searchParams.set('tags', postData.tags);
      }
      imageUrl = defaultImageUrl.toString();
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

    // Format the title to include author name for better SEO and social sharing
    const seoTitle = `${title} | by ${authorName} | ${SITE_CONFIG.name}`;
    
    return {
      title: seoTitle,
      description: `${description} - Written by ${authorName} on ${SITE_CONFIG.name}`,
      applicationName: SITE_CONFIG.name,
      authors: [{
        name: authorName,
        ...(authorTwitter && { 
          url: `https://twitter.com/${authorTwitter}`,
          twitter: `@${authorTwitter}`
        })
      }],
      keywords: [...(tagList || []), authorName, ...(category ? [category] : [])],
      creator: authorTwitter ? `@${authorTwitter}` : `@${SITE_CONFIG.author.twitter}`,
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
        title: seoTitle,
        description: `${description} - Written by ${authorName} on ${SITE_CONFIG.name}`,
        type: 'article',
        publishedTime,
        modifiedTime,
        authors: [authorName],
        url,
        locale: 'en_US',
        siteName: SITE_CONFIG.name,
        section: category || 'General',
        tags: tagList,
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
        title: seoTitle,
        description: `${description} - Written by ${authorName} on ${SITE_CONFIG.name}`,
        images: [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }],
        creator: authorTwitter ? `@${authorTwitter}` : `@${SITE_CONFIG.author.twitter}`,
        site: `@${SITE_CONFIG.author.twitter}`,
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
      // Additional meta tags
      other: {
        // OpenGraph meta
        'og:site_name': SITE_CONFIG.name,
        'og:type': 'article',
        'og:title': seoTitle,
        'og:description': `${description} - Written by ${authorName} on ${SITE_CONFIG.name}`,
        'og:url': url,
        'og:image': imageUrl,
        'og:image:secure_url': imageUrl,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': `Cover image for ${title}`,
        'og:image:type': 'image/png',
        'og:locale': 'en_US',
        'og:updated_time': new Date().toISOString(),
        
        // Article meta
        'article:author': authorName,
        'article:published_time': publishedTime,
        'article:modified_time': modifiedTime,
        'article:section': category || 'General',
        'article:tag': tagList,
        
        // Twitter meta
        'twitter:image:src': imageUrl,
        'twitter:label1': 'Written by',
        'twitter:data1': authorName,
        'twitter:label2': 'Filed under',
        'twitter:data2': category || 'General',
        'twitter:app:name:iphone': SITE_CONFIG.name,
        'twitter:app:name:ipad': SITE_CONFIG.name,
        'twitter:app:name:googleplay': SITE_CONFIG.name,
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
