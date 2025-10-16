import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, ExternalLink, BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTechColor } from '@/components/skillColors';
import HtmlRenderer from '@/components/blog/HtmlRenderer';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  // Find the project by ID
  const project = projects.find(p => 
    p.title.toLowerCase().replace(/\s+/g, '-') === params.id
  );

  if (!project) {
    notFound();
  }

  const formatDate = (date: Date | 'Present'): string => {
    if (date === 'Present') return 'Present';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/projects" 
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>

        <article className="prose dark:prose-invert max-w-none">
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className={cn(
                'px-3 py-1 text-sm font-medium rounded-full',
                {
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': project.status === 'deployed',
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': project.status === 'active' || project.status === 'in-progress',
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400': project.status === 'completed',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': project.status === 'on-hold',
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': project.status === 'abandoned',
                }
              )}>
                {project.status.replace('-', ' ')}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {project.technologies.map((tech) => {
                const { bg, text, border, hover } = getTechColor(tech);
                return (
                  <span 
                    key={tech} 
                    className={`px-3 py-1 text-sm rounded-full border ${bg} ${text} ${border} ${hover} transition-colors`}
                  >
                    {tech}
                  </span>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              {project.github && (
                <Button asChild variant="outline">
                  <Link href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Link>
                </Button>
              )}
              
              {project.live && (
                <Button asChild>
                  <Link href={project.live} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </Link>
                </Button>
              )}
              
              {project.documentation && (
                <Button asChild variant="ghost">
                  <Link href={project.documentation} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Documentation
                  </Link>
                </Button>
              )}
            </div>
          </header>

          <div className="space-y-12">
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div className="relative h-64 md:h-96 w-full">
                <Image
                  src={project.images[0]}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h2>About This Project</h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-300">
                {project.description}
              </p>
              
              {project.blogPost && (
                <div className="mt-8">
                  <h3>Related Blog Post</h3>
                  <Link 
                    href={project.blogPost}
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                  >
                    Read the blog post <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>

            {project.images.length > 1 && (
              <div>
                <h2>Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {project.images.slice(1).map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <div className="relative h-48 w-full">
                        <Image
                          src={image}
                          alt={`${project.title} screenshot ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {project.content && (
              <div className="prose dark:prose-invert max-w-none">
                <h2>Project Details</h2>
                <HtmlRenderer content={project.content} />
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
