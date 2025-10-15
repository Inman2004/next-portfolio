'use client';

import React, { useRef } from 'react';
import { motion as m, useInView } from 'framer-motion';
import { BookOpen, Code, Cpu, Database, GitBranch, Layout, Server, Terminal, CheckCircle, Lock, Globe, Box, Cloud, Code2, Network, Paintbrush2 } from 'lucide-react';
import { SiNextdotjs, SiReact } from 'react-icons/si';

const steps = [
  // Frontend Basics
  { 
    id: 'html-css',
    title: 'HTML & CSS', 
    category: 'Frontend Basics',
    description: 'Learn the structure and styling of web pages',
    icon: <Layout className="w-5 h-5" />,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    status: 'completed',
    checkpoint: 'Static Webpages'
  },
  { 
    id: 'javascript',
    title: 'JavaScript', 
    category: 'Programming',
    description: 'Master the language that powers the web',
    icon: <Code className="w-5 h-5" />,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    status: 'completed',
    checkpoint: 'Interactivity'
  },
  { 
    id: 'npm-packages',
    title: 'npm & Packages', 
    category: 'Package Manager',
    description: 'Manage dependencies and external packages',
    icon: <Terminal className="w-5 h-5" />,
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-300',
    status: 'completed',
    checkpoint: 'External Packages'
  },

  // Version Control
  { 
    id: 'git',
    title: 'Git & GitHub', 
    category: 'Version Control',
    description: 'Track changes and collaborate with others',
    icon: <GitBranch className="w-5 h-5" />,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
    status: 'completed',
    checkpoint: 'Collaborative Work'
  },

  // Frontend Framework
  { 
    id: 'react-tailwind',
    title: 'React & Tailwind CSS',
    description: 'Modern frontend development with React and utility-first CSS',
    category: 'Frontend Stack',
    status: 'completed',
    color: 'bg-cyan-600',
    textColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    icon: <SiReact className="w-5 h-5" />,
    checkpoint: true
  },

  // Backend Development
  {
    id: 'node-express',
    title: 'Node.js & Express',
    description: 'JavaScript backend development with Node.js and Express framework',
    category: 'Backend Stack',
    status: 'completed',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: <Server className="w-5 h-5" />,
    checkpoint: true
  },

  // FrameWork
  { 
    id: 'nextjs',
    title: 'Next.js',
    description: 'Modern Server Side Rendering & Static Site Generation',
    category: 'FrameWork',
    status: 'completed',
    color: 'bg-zinc-800',
    textColor: 'text-zinc-900 dark:text-zinc-50',
    bgColor: 'bg-zinc-50 dark:bg-zinc-900/30',
    borderColor: 'border-zinc-400 dark:border-zinc-600',
    icon: <SiNextdotjs className="w-5 h-5" />,
    checkpoint: true
  },

  // Database
  {
    id: 'databases',
    title: 'PostgreSQL & MongoDB',
    description: 'Relational and NoSQL database management',
    category: 'Databases',
    status: 'current',
    color: 'bg-teal-600',
    textColor: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/30',
    borderColor: 'border-teal-200 dark:border-teal-800',
    icon: <Database className="w-5 h-5" />,
    checkpoint: true
  },

  // Authentication & APIs
  { 
    id: 'auth',
    title: 'JWT Auth', 
    category: 'Authentication',
    description: 'Secure your applications',
    icon: <Lock className="w-5 h-5" />,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    status: 'completed',
    checkpoint: 'Complete App'
  },
  { 
    id: 'rest-apis',
    title: 'RESTful APIs', 
    category: 'API Design',
    description: 'Build scalable web services',
    icon: <Globe className="w-5 h-5" />,
    color: 'bg-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    textColor: 'text-rose-700 dark:text-rose-300',
    status: 'completed'
  },

  // DevOps
  { 
    id: 'docker',
    title: 'Docker', 
    category: 'Containerization',
    description: 'Containerize your applications',
    icon: <Box className="w-5 h-5" />,
    color: 'bg-sky-500',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    borderColor: 'border-sky-200 dark:border-sky-800',
    textColor: 'text-sky-700 dark:text-sky-300',
    status: 'current',
    checkpoint: 'CI/CD'
  },
  { 
    id: 'aws',
    title: 'AWS', 
    category: 'Cloud Services',
    description: 'Deploy and scale applications',
    icon: <Cloud className="w-5 h-5" />,
    color: 'bg-fuchsia-500',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
    textColor: 'text-fuchsia-700 dark:text-fuchsia-300',
    status: 'current',
    checkpoint: 'Deployment'
  },
  { 
    id: 'terraform',
    title: 'Terraform', 
    category: 'Infrastructure as Code',
    description: 'Manage infrastructure with code',
    icon: <Code2 className="w-5 h-5" />,
    color: 'bg-violet-500',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    textColor: 'text-violet-700 dark:text-violet-300',
    status: 'pending',
    checkpoint: 'Infrastructure'
  }
];

const StatusIcon = ({ status }: { status?: string }) => {
  if (!status) return null;
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'current':
      return <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />;
    case 'pending':
      return <div className="w-4 h-4 border-2 border-zinc-300 rounded-full" />;
    default:
      return null;
  }
};

export default function RoadmapTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
           My Full Stack Development Journey 
          </span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg l max-w-3xl mx-auto">
          Each step is a checkpoint in my journey to becoming a modern full stack developer
        </p>
      </div>

      <m.div 
        ref={ref}
        variants={container}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        className="relative"
      >
        {/* Grid Layout (md+) and Horizontal Snap Carousel (mobile) */}
        <div className="
          flex gap-4 overflow-x-auto snap-x snap-mandatory px-2 -mx-2
          md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:mx-0
          lg:grid-cols-3
        ">
          {steps.map((step, index) => (
            <m.div
              key={step.id}
              variants={item}
              className="group relative min-w-[85%] snap-start shrink-0 md:min-w-0"
            >
              <div className={`
                p-4 rounded-xl border-2 transition-all duration-300 h-full flex flex-col
                ${step.bgColor} ${step.borderColor}
                hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-800/50
                hover:scale-[1.02] hover:-tranzinc-y-1
                ${step.status === 'current' ? 'ring-2 ring-emerald-500/50 dark:ring-emerald-500/50 ring-offset-2' : ''}
              `}>
                <div className="absolute -top-2 -right-2">
                  <StatusIcon status={step.status} />
                </div>
                {/* Status Indicator */}
                <div className="flex items-center mb-3">
                  <div className={`
                    p-1.5 rounded-lg ${step.color} text-white
                    shadow-lg shadow-zinc-900/20 mr-3
                  `}>
                    {React.cloneElement(step.icon, { className: 'w-4 h-4' })}
                  </div>
                  <h3 className={`font-semibold ${step.textColor} text-base`}>
                    {step.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="flex-grow space-y-2">
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    {step.category}
                  </p>
                  <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed line-clamp-2">
                    {step.description}
                  </p>
                  {step.checkpoint && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        Checkpoint: {step.checkpoint}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full ${step.color} transition-all duration-1000 ease-out`}
                    style={{ 
                      width: step.status === 'completed' ? '100%' : 
                             step.status === 'current' ? '60%' : '0%' 
                    }}
                  />
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 dark:from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </m.div>
          ))}
        </div>

        {/* Legend (hidden on mobile to reduce height) */}
        <div className="mt-8 hidden md:flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-zinc-300 rounded-full" />
            <span>Not Started</span>
          </div>
        </div>
      </m.div>
    </div>
  );
}