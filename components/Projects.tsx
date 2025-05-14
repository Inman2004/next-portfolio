import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Github, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  github?: string;
  live?: string;
  images: string[];  // Array of image URLs for the slideshow
}

const projects: Project[] = [
  {
    title: "HR AI",
    description: "A mock interview platform powered by VAPI voice agent",
    technologies: ["Next.js", "React", "TailwindCSS", "TypeScript", "Framer Motion", "VAPI API"],
    github: "https://github.com/Inman2004/hr-ai",
    live: "https://Mocker.vercel-app",
    images: ["/images/projects/hr1.png", "/images/projects/hr2.png", "/images/projects/hr3.png"]
  },
  {
    title: "MoviesDB",
    description: "A modern, responsive React application for browsing movies, powered by TMDB API. Built with React, TypeScript, and Tailwind CSS.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "TMDB API"],
    github: "https://github.com/Inman2004/moviesdb",
    live: "https://moviesdb-nine.vercel.app",
    images: ["/images/projects/mdb.png", "/images/projects/mdb2.png", "/images/projects/mdb3.png"]
  },
  {
    title: "E-commerce Platform",
    description: "A modern e-commerce platform with advanced filtering, search, and payment integration.",
    technologies: ["React.js", "PHP", "MySql", "Styled Components"],
    github: "https://github.com/Inman2004/ecommerce",
    live: "https://nykaa-immanuvel.vercel.app",
    images: ["/images/projects/ecommerce-1.png", "/images/projects/ecommerce-2.png", "/images/projects/ecommerce-3.png", "/images/projects/ecommerce-4.png"]
  },
  {
    title: "Data Handler",
    description: "A full-stack web interface that allows users to upload and display a CSV file. Features include filtering by date and restaurant name, displaying data in a responsive table, a mock email send feature for recruiters, and download and delete functionalities.",
    technologies: ["Next.js", "Python", "Flask", "Pandas"],
    github: "https://github.com/Inman2004/assinment-data-handler",
    live: "https://data-handler.vercel.app",
    images: ["/images/projects/dh.png", "/images/projects/dh2.png", "/images/projects/dh3.png"]
  }
];

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && project.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, project.images.length]);

  const nextImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  };

  const prevImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="h-full overflow-hidden rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-800 hover:border-blue-500 transition-all duration-300">
        {/* Image Slideshow */}
        <div className="relative w-full h-[200px] sm:h-[250px] overflow-hidden">
          <AnimatePresence mode="sync">
            {project.images.length > 0 && (
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={project.images[currentImageIndex]}
                  alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {project.images.length > 1 && (
            <>
              <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevImage}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextImage}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: isAutoPlaying ? "100%" : `${(currentImageIndex / (project.images.length - 1)) * 100}%` 
                  }}
                  transition={isAutoPlaying ? { 
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop"
                  } : {
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>

              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {project.images.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentImageIndex(i);
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentImageIndex 
                        ? 'bg-white shadow-lg shadow-white/20' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <motion.div
          animate={isHovered ? { y: -8 } : { y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6 space-y-4"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            {project.title}
          </h3>
          <p className="text-gray-300 line-clamp-3">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm font-medium bg-blue-500/10 text-blue-400 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex gap-4 pt-2">
            {project.github && (
              <motion.a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-6 h-6" />
              </motion.a>
            )}
            {project.live && (
              <motion.a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-6 h-6" />
              </motion.a>
            )}
          </div>
        </motion.div>

        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
};

const Projects = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-6">
          Featured Projects
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Here are some of my recent projects that showcase my skills and experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Projects; 