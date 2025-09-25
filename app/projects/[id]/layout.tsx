import { Metadata, ResolvingMetadata } from 'next';
import { projects } from '@/data/projects';
import { SITE_CONFIG } from '@/config/site';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Find the project by ID
  const project = projects.find(p => 
    p.title.toLowerCase().replace(/\s+/g, '-') === params.id
  );

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
      robots: 'noindex, nofollow',
    };
  }

  const title = `${project.title} | ${SITE_CONFIG.name}`;
  const description = project.description.substring(0, 160);
  const url = new URL(`/projects/${params.id}`, SITE_CONFIG.url).toString();
  
  // Use the first image as the OpenGraph image if available
  const imageUrl = project.images && project.images.length > 0
    ? new URL(project.images[0], SITE_CONFIG.url).toString()
    : new URL('/default-og-image.jpg', SITE_CONFIG.url).toString();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {children}
    </div>
  );
}
