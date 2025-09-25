'use client';

import * as React from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';  
import { useState, useEffect, useMemo } from 'react';
import { Github, ExternalLink, ChevronLeft, ChevronRight, BookOpen, Search, X as XIcon, Filter, ArrowRight, Flame, Eye, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { FaBlog } from 'react-icons/fa6';
import { projects, type Project, type ProjectStatus } from '@/data/projects';
import { InteractiveHoverButton } from './magicui/interactive-hover-button';

// Technology to color mapping with better TypeScript support
interface TechColor {
  bg: string;
  text: string;
  border?: string;
}

const getTechColor = (tech: string): TechColor => {
  const techLower = tech.toLowerCase();
  const colors: Record<string, TechColor> = {
    // Frontend
    html: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-500/20' },
    css: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    
    // Frontend Frameworks
    react: { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
    next: { bg: 'bg-black/10 dark:bg-white/20', text: 'text-zinc-800 dark:text-white', border: 'border-zinc-400/20' },
    'next.js': { bg: 'bg-black/10 dark:bg-white/20', text: 'text-zinc-800 dark:text-white', border: 'border-zinc-400/20' },
    vue: { bg: 'bg-green-500/10 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
    angular: { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
    svelte: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
    tailwind: { bg: 'bg-sky-500/10 dark:bg-sky-500/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20' },
    
    // Backend
    node: { bg: 'bg-lime-500/10 dark:bg-lime-500/20', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-500/20' },
    express: { bg: 'bg-zinc-500/10 dark:bg-zinc-500/20', text: 'text-zinc-600 dark:text-zinc-300', border: 'border-zinc-500/20' },
    php: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
    laravel: { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
    django: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
    flask: { bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20' },
    firebase: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
    
    // Databases
    mysql: { bg: 'bg-yellow-500/10 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
    postgres: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    mongodb: { bg: 'bg-green-500/10 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
    redis: { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
    
    // Languages
    typescript: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    javascript: { bg: 'bg-yellow-500/10 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
    python: { bg: 'bg-amber-500/20 dark:bg-amber-500/20', text: 'text-blue-600 dark:text-blue-400/80', border: 'border-yellow-500/20' },
    java: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
    
    // Tools & Others
    docker: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    git: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
    api: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
    framer: { bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20' },
    vercel: { bg: 'bg-black/10 dark:bg-white/20', text: 'text-zinc-800 dark:text-white', border: 'border-zinc-400/20' },
    tensorflow: { bg: 'bg-yellow-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
    pytorch: { bg: 'bg-yellow-500/10 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
    keras: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    matplotlib: { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
    seaborn: { bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/20' },
    scikit_learn: { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
    
    
  };

  // Find the best matching color
  for (const [key, value] of Object.entries(colors)) {
    if (techLower.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default fallback
  return { 
    bg: 'bg-zinc-500/10 dark:bg-zinc-500/20', 
    text: 'text-zinc-600 dark:text-zinc-300',
    border: 'border-zinc-500/20'
  };
};

// Project interface is now imported from data/projects

// Format date as 'MMM YYYY' (e.g., 'Jan 2023')
const formatDate = (date: Date | 'Present'): string => {
  if (date === 'Present') return 'Present';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Safely format date that could be string or Date
const safeFormatDate = (date: string | Date | 'Present'): string => {
  if (date === 'Present') return 'Present';
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDate(dateObj);
};

// Safely calculate duration with flexible date types
const safeCalculateDuration = (start: string | Date, end: string | Date | 'Present'): string => {
  const startDate = start instanceof Date ? start : new Date(start);
  return calculateDuration(startDate, end === 'Present' ? 'Present' : (end instanceof Date ? end : new Date(end)));
};

// Calculate duration in months
const calculateDuration = (startDate: Date, endDate: Date | 'Present'): string => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate === 'Present' ? new Date() : (endDate instanceof Date ? endDate : new Date(endDate));
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                (end.getMonth() - start.getMonth()) + 
                (end.getDate() >= start.getDate() ? 0 : -1);
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
};

interface ProjectWithVideos extends Omit<Project, 'startDate' | 'endDate'> {
  videoPreviews?: Array<{
    url: string;
    thumbnail: string;
    duration?: number;
  }>;
  startDate: string | Date;
  endDate: string | Date | 'Present';
}

const ProjectCard = ({ project, index }: { project: ProjectWithVideos; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const hasVideoPreviews = project.videoPreviews && project.videoPreviews.length > 0;
  // Show videos first, then images
  const allMedia = [
    ...(project.videoPreviews || []).map(vid => ({
      type: 'video' as const,
      src: vid.url,
      thumbnail: vid.thumbnail
    })),
    ...(project.images || []).map(img => ({
      type: 'image' as const,
      src: img
    }))
  ];

  // Optimize media loading
  useEffect(() => {
    if (project.images.length > 0) {
      const img = new window.Image();
      img.src = project.images[0];
      img.onload = () => setIsImageLoaded(true);
    } else if (hasVideoPreviews) {
      setIsImageLoaded(true);
    }
  }, [project.images, hasVideoPreviews]);

  const handlePrev = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const handleNext = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
  };
  
  const currentMedia = allMedia[currentMediaIndex];

  // Only render the card when the image is loaded
  if (!isImageLoaded) {
    return (
      <div className="h-full rounded-xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
        type: 'spring',
        stiffness: 100
      }}
      className="h-full relative group"
      style={{ zIndex: 'auto' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full">
        {/* Card content */}
        <div 
          className="h-full overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 
                   transition-all duration-300 shadow-sm dark:shadow-zinc-900/20 relative
                   hover:border-blue-500 dark:hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20"
          onClick={(e) => {
            // Only handle card click if no button was clicked
            if (!(e.target as HTMLElement).closest('a, button')) {
              // Handle card click if needed
            }
          }}
        >
        {/* Status Badge */}
        <m.div 
          className="absolute top-3 right-3 z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <m.span 
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full 
              shadow-lg transition-all duration-300 hover:scale-105 ${
              project.status === 'active' ? 
                'bg-gradient-to-r from-green-500/30 to-emerald-500/30 dark:from-green-500/20 dark:to-emerald-500/20 ' +
                'text-green-700 dark:text-green-300 border border-green-500/40 dark:border-green-500/30 ' +
                'shadow-green-500/10 hover:shadow-green-500/20' :
              project.status === 'completed' ? 
                'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 dark:from-blue-500/20 dark:to-indigo-500/20 ' +
                'text-blue-700 dark:text-blue-300 border border-blue-500/40 dark:border-blue-500/30 ' +
                'shadow-blue-500/10 hover:shadow-blue-500/20' :
              project.status === 'deployed' ? 
                'bg-gradient-to-r from-purple-500/30 to-blue-500/30 dark:from-purple-500/20 dark:to-blue-500/20 ' +
                'text-purple-700 dark:text-purple-300 border border-purple-500/40 dark:border-purple-500/30 ' +
                'shadow-purple-500/10 hover:shadow-purple-500/20' :
              project.status === 'outdated' ? 
                'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 dark:from-amber-500/20 dark:to-yellow-500/20 ' +
                'text-amber-700 dark:text-amber-300 border border-yellow-500/40 dark:border-yellow-500/30 ' +
                'shadow-yellow-500/10 hover:shadow-yellow-500/20' :
              project.status === 'abandoned' ? 
                'bg-gradient-to-r from-red-500/30 to-rose-500/30 dark:from-red-500/20 dark:to-rose-500/20 ' +
                'text-red-700 dark:text-red-300 border border-red-500/40 dark:border-red-500/30 ' +
                'shadow-red-500/10 hover:shadow-red-500/20' :
              project.status === 'in-progress' ? 
                'bg-gradient-to-r from-amber-500/30 to-orange-500/30 dark:from-amber-500/20 dark:to-orange-500/20 ' +
                'text-amber-700 dark:text-amber-300 border border-amber-500/40 dark:border-amber-500/30 ' +
                'shadow-amber-500/10 hover:shadow-amber-500/20' :
                'bg-gradient-to-r from-zinc-500/30 to-zinc-500/30 dark:from-zinc-500/20 dark:to-zinc-500/20 ' +
                'text-zinc-700 dark:text-zinc-300 border border-zinc-500/40 dark:border-zinc-500/30 ' +
                'shadow-zinc-500/10 hover:shadow-zinc-500/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {project.status.replace('-', ' ')}
          </m.span>
        </m.div>
        
        {/* Image Slideshow */}
        <div className="relative h-48 md:h-60 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {!isImageLoaded ? (
            <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          ) : currentMedia?.type === 'video' ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={currentMedia.src}
                poster={currentMedia.thumbnail}
                loop
                muted
                playsInline
                onLoadedData={() => {
                  setIsVideoLoaded(true);
                  videoRef.current?.play().then(() => {
                    setIsVideoPlaying(true);
                  }).catch(console.error);
                }}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play().catch(console.error);
                  }
                }}
                className="w-full h-full object-cover"
              />
              {!isVideoPlaying && isVideoLoaded && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                  onClick={() => videoRef.current?.play()}
                >
                  <div className="bg-black/50 p-3 rounded-full">
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Image
              src={currentMedia.src}
              alt={`${project.title} screenshot`}
              fill
              className="object-cover transition-opacity duration-300"
              style={{ opacity: isImageLoaded ? 1 : 0 }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 3}
            />
          )}
          
          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -tranzinc-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -tranzinc-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Next media"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {allMedia.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex(i);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentMediaIndex 
                        ? allMedia[i].type === 'video' 
                          ? 'w-6 bg-blue-400' 
                          : 'w-6 bg-white'
                        : 'w-3 bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to ${allMedia[i].type} ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <m.div
          animate={isHovered ? { y: -8 } : { y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6 space-y-4"
          onClick={() => window.location.href = `/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}`}
          style={{ cursor: 'pointer' }}
        >
          <div className="p-5 flex flex-col relative z-10">
            <Link 
              href={`/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={(e) => e.stopPropagation()}
              className="group"
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                {project.title}
              </h3>
            </Link>
            <div className="flex items-center text-sm text-zinc-400 space-x-4">
              <span>
                {safeFormatDate(project.startDate)} - {safeFormatDate(project.endDate)}
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-600"></span>
              <span>{safeCalculateDuration(project.startDate, project.endDate)}</span>
            </div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 line-clamp-3 transition-colors duration-300">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 transition-colors duration-300">
            {project.technologies.map((tech, i) => {
              const { bg, text, border } = getTechColor(tech);
              return (
                <span
                  key={`${project.title}-tech-${tech}-${i}`}
                  className={cn(
                    'px-3 py-1 text-sm font-medium rounded-full transition-colors',
                    'border border-opacity-20',
                    bg,
                    text,
                    border || 'border-transparent',
                    'hover:opacity-90 dark:hover:opacity-100',
                    'whitespace-nowrap overflow-hidden text-ellipsis max-w-full inline-block'
                  )}
                  title={tech}
                >
                  {tech}
                </span>
              );
            })}
          </div>

          <div className="flex gap-4 pt-2 relative z-10" onClick={e => e.stopPropagation()}>
            {project.github && (
              <div className="relative">
                <m.a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  onClick={e => e.stopPropagation()}
                  whileTap={{ scale: 0.95 }}
                  title="View on GitHub"
                >
                  <Github className="w-6 h-6" />
                  <span className="sr-only">GitHub</span>
                </m.a>
              </div>
            )}
            {project.live && (
              <div className="relative">
                <m.a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="View Live Demo"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span className="sr-only">Live</span>
                </m.a>
              </div>
            )}
            {project.documentation && (
              <div className="relative">
                <m.a
                  href={project.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:scale-110 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="View Documentation"
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="sr-only">Documentation</span>
                </m.a>
              </div>
            )}
            {project.blogPost && (
              <div className="relative">
                <m.a
                  href={project.blogPost}
                  target="_self"
                  rel="noopener noreferrer"
                  className="inline-block text-zinc-500 hover:text-orange-600 hover:fill-orange-600 dark:hover:text-orange-400 dark:hover:fill-orange-400 hover:scale-110 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Read Blog Post"
                >
                  <FaBlog className="w-6 h-6" />
                  <span className="sr-only">Blog Post</span>
                </m.a>
              </div>
            )}
            
          </div>
        </m.div>
      </div>
      
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-600/5 dark:to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
    </div>
    </m.div>
  );
};

interface ProjectsProps {
  showAll?: boolean;
  maxItems?: number;
}

const Projects = ({ showAll = false, maxItems = 3 }: ProjectsProps) => {
  const displayedProjects = showAll ? projects : projects.slice(0, maxItems);
  return (
    <div id="projects" className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 -mt-20 transition-colors duration-300">
      {!showAll && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.1
          }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent mb-4 transition-colors duration-300">
            Featured Projects
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto transition-colors duration-300">
            Here are some of my recent projects that showcase my skills and experience.
          </p>
        </m.div>
      )}

      <AnimatePresence mode="wait">
        <React.Fragment key={showAll ? 'all' : 'preview'}>
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayedProjects.map((project: Project, index: number) => (
              <ProjectCard key={`${project.title}-${index}`} project={project} index={index} />
            ))}
          </m.div>
          
          {!showAll && projects.length > maxItems && (
            <div className="mt-12 text-center">
              <Link className='bg-transparent hover:bg-transparent' href="/projects">
                <InteractiveHoverButton>
                  View All Projects
                </InteractiveHoverButton>
              </Link>
            </div>
          )}
        </React.Fragment>
      </AnimatePresence>
    </div>
  );
};

export default Projects;