'use client';

import { motion } from 'framer-motion';
import { Briefcase, ExternalLink, MapPin, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ExperienceType } from '@/data/experiences';
import { useState, useEffect } from 'react';
import { fetchExperiences } from '@/lib/api';

const ExperienceCard = ({ exp, isLast }: { exp: ExperienceType; isLast: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="relative flex group">
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/20 to-purple-500/20 ml-6"></div>
      
      {/* Timeline dot */}
      <div className="absolute left-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 -translate-x-1/2 z-10 flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>

      <div className="ml-12 w-full">
        {/* Date for mobile */}
        <div className="md:hidden text-sm text-gray-400 mb-2">
          {exp.startDate} - {exp.endDate}
        </div>

        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ y: -2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {exp.logo ? (
                  <Image 
                    src={exp.logo} 
                    alt={`${exp.company} logo`} 
                    width={40} 
                    height={40} 
                    className="object-contain w-10 h-10"
                    unoptimized={exp.logo.startsWith('http')}
                  />
                ) : (
                  <Briefcase className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{exp.role}</h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mt-1">
                  {exp.companyUrl ? (
                    <a 
                      href={exp.companyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {exp.company}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span>{exp.company}</span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {exp.location}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Date for desktop */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 bg-white/5 rounded-full px-4 py-1.5">
              <Calendar className="w-4 h-4" />
              <span>{exp.startDate} - {exp.endDate}</span>
            </div>
            
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
          
          <motion.div 
            className="overflow-hidden"
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, marginTop: isExpanded ? '1rem' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-4 border-t border-white/5">
              <ul className="space-y-2 text-gray-300">
                {exp.description.map((item, i) => (
                  <li key={`${exp.id}-desc-${i}`} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {exp.skills.map((skill, i) => (
                  <span 
                    key={`${exp.id}-skill-${i}-${skill.replace(/\s+/g, '-')}`} 
                    className="px-3 py-1 text-xs rounded-full bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default function Experience() {
  const [experiences, setExperiences] = useState<ExperienceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setLoading(true);
        console.log('Fetching experiences...');
        const data = await fetchExperiences();
        console.log('Fetched experiences data:', JSON.stringify(data, null, 2));
        
        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setExperiences(data);
        } else {
          console.error('Invalid data format received:', data);
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Failed to load experiences:', err);
        setError('Failed to load experiences. Using fallback data.');
        
        // Try to load from local data as fallback
        try {
          const localData = await import('@/data/experiences');
          console.log('Using local experiences data as fallback');
          setExperiences(localData.experiences);
        } catch (e) {
          console.error('Failed to load fallback experiences:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    loadExperiences();
  }, []);
  
  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Work Experience
        </h2>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          My professional journey and the companies I've worked with
        </p>
      </motion.div>

      <div className="relative">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            {error}
          </div>
        ) : (
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={`exp-${exp.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ExperienceCard 
                  exp={exp} 
                  isLast={index === experiences.length - 1} 
                />
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl -z-10"></div>
      </div>
    </section>
  );
}