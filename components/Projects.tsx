import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Github, ExternalLink, ChevronLeft, ChevronRight, BookOpen, Search, X as XIcon, Filter } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    next: { bg: 'bg-black/10 dark:bg-white/20', text: 'text-gray-800 dark:text-white', border: 'border-gray-400/20' },
    'next.js': { bg: 'bg-black/10 dark:bg-white/20', text: 'text-gray-800 dark:text-white', border: 'border-gray-400/20' },
    vue: { bg: 'bg-green-500/10 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
    angular: { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
    svelte: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
    tailwind: { bg: 'bg-sky-500/10 dark:bg-sky-500/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20' },
    
    // Backend
    node: { bg: 'bg-lime-500/10 dark:bg-lime-500/20', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-500/20' },
    express: { bg: 'bg-gray-500/10 dark:bg-gray-500/20', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-500/20' },
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
    python: { bg: 'bg-yellow-500/10 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
    java: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
    
    // Tools & Others
    docker: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    git: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
    api: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
    framer: { bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20' },
    vercel: { bg: 'bg-black/10 dark:bg-white/20', text: 'text-gray-800 dark:text-white', border: 'border-gray-400/20' },
  };

  // Find the best matching color
  for (const [key, value] of Object.entries(colors)) {
    if (techLower.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default fallback
  return { 
    bg: 'bg-gray-500/10 dark:bg-gray-500/20', 
    text: 'text-gray-600 dark:text-gray-300',
    border: 'border-gray-500/20'
  };
};

interface Project {
  title: string;
  description: string;
  technologies: string[];
  github?: string;
  live?: string;
  documentation?: string;
  images: string[];
  startDate: Date;
  endDate: Date | 'Present';
}

// Format date as 'MMM YYYY' (e.g., 'Jan 2023')
const formatDate = (date: Date | 'Present'): string => {
  if (date === 'Present') return 'Present';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Calculate duration in months
const calculateDuration = (startDate: Date, endDate: Date | 'Present'): string => {
  const start = new Date(startDate);
  const end = endDate === 'Present' ? new Date() : new Date(endDate);
  
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

import { projects } from '@/data/projects';

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Optimize image loading
  useEffect(() => {
    const img = new window.Image();
    img.src = project.images[0];
    img.onload = () => setIsImageLoaded(true);
  }, [project.images]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && project.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, project.images.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  };

  // Only render the card when the image is loaded
  if (!isImageLoaded) {
    return (
      <div className="h-full rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse" />
    );
  }

  return (
    <motion.div
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
      onMouseEnter={() => {
        setIsHovered(true);
        setIsAutoPlaying(false);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsAutoPlaying(true);
      }}
    >
      <div className="h-full">
        {/* Card content */}
        <div 
          className="h-full overflow-hidden rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 
                   transition-all duration-300 shadow-sm dark:shadow-gray-900/20 relative
                   hover:border-blue-500 dark:hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20"
          onClick={(e) => {
            // Only handle card click if no button was clicked
            if (!(e.target as HTMLElement).closest('a, button')) {
              // Handle card click if needed
            }
          }}
        >
        {/* Image Slideshow */}
        <div className="relative w-full h-[200px] sm:h-[250px] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {project.images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: i === 0 ? 1 : 0 }}
              animate={{
                opacity: i === currentImageIndex ? 1 : 0,
                scale: i === currentImageIndex ? 1 : 0.95,
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={img}
                alt={`${project.title} screenshot ${i + 1}`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 3 && i === 0} // Only load first image of first 3 cards with priority
                onLoadingComplete={() => {
                  if (i === 0) setIsImageLoaded(true);
                }}
              />
            </motion.div>
          ))}
          {/* Navigation Arrows - Only show on hover */}
          {project.images.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  x: isHovered ? 0 : -10
                }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  handlePrev();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-10 transition-all duration-300"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  x: isHovered ? 0 : 10
                }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-10 transition-all duration-300"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0.7,
                  y: isHovered ? 0 : 5
                }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2"
              >
                {project.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      setCurrentImageIndex(i);
                      setIsAutoPlaying(false);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className={`w-2 h-2 rounded-full transition-all duration-300 relative z-20 ${
                      i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`View image ${i + 1} of ${project.images.length}`}
                  />
                ))}
              </motion.div>
            </>
          )}
        </div>

        <motion.div
          animate={isHovered ? { y: -8 } : { y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6 space-y-4"
        >
          <div className="p-5 flex flex-col relative z-10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              {project.title}
            </h3>
            <div className="flex items-center text-sm text-gray-400 space-x-4">
              <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
              <span className="h-1 w-1 rounded-full bg-gray-600"></span>
              <span>{calculateDuration(project.startDate, project.endDate)}</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3 transition-colors duration-300">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2 transition-colors duration-300">
            {project.technologies.map((tech, i) => {
              const { bg, text, border } = getTechColor(tech);
              return (
                <span
                  key={i}
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

          <div className="flex gap-4 pt-2 relative z-10">
            {project.github && (
              <div className="relative">
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="View on GitHub"
                >
                  <Github className="w-6 h-6" />
                  <span className="sr-only">GitHub</span>
                </motion.a>
              </div>
            )}
            {project.live && (
              <div className="relative">
                <motion.a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="View Live Demo"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span className="sr-only">Live</span>
                </motion.a>
              </div>
            )}
            {project.documentation && (
              <div className="relative">
                <motion.a
                  href={project.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-110 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="View Documentation"
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="sr-only">Documentation</span>
                </motion.a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-600/5 dark:to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
    </div>
    </motion.div>
  );
};

const Projects = () => {
  return (
    <div id="projects" className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 -mt-20 transition-colors duration-300">
      <motion.div
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
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto transition-colors duration-300">
          Here are some of my recent projects that showcase my skills and experience.
        </p>
      </motion.div>

      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
        >
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Projects; 