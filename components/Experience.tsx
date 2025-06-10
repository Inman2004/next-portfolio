'use client';

import { motion } from 'framer-motion';
import { Briefcase, Calendar, Clock, ExternalLink, MapPin, X, CheckCircle2, ChevronDown, ChevronRight, Loader2, FileSearch, FileCheck2, CalendarCheck2, CalendarClock, Smile } from 'lucide-react';
import { SkillBadge } from '@/components/skillColors';
import Image from 'next/image';
import { ExperienceType, ExperienceStatus } from '@/data/experiences';
import { useState, useEffect } from 'react';
import { fetchExperiences } from '@/lib/api';

// Define the API response type
interface ApiResponse {
  success: boolean;
  data: ExperienceType[];
  debug?: {
    headers: [string, string][];
    status: number;
    sheetUrl: string;
  };
}

type ExperienceCardProps = {
  exp: ExperienceType;
  isLast: boolean;
};

const ExperienceCard = ({ exp, isLast }: ExperienceCardProps) => {
  console.log('Rendering ExperienceCard with:', {
    id: exp.id,
    company: exp.company,
    status: exp.status,
    hasStatus: 'status' in exp,
    exp: JSON.stringify(exp, null, 2)
  });
  // Format status for display
  const formatStatus = (status: ExperienceStatus): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get status badge color and icon
  const getStatusBadgeProps = (status: ExperienceStatus, index: number, total: number) => {
    const base = {
      className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium',
      icon: null as React.ReactNode,
      text: formatStatus(status),
      isFirst: index === 0,
      isLast: index === total - 1
    };

    let statusProps;
    
    switch (status) {
      case 'working':
        statusProps = {
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          icon: <CheckCircle2 className="w-3 h-3" />
        };
        break;
      case 'interview':
        statusProps = {
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          icon: <FileSearch className="w-3 h-3" />
        };
        break;
      case 'issued_offer':
        statusProps = {
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
          icon: <FileCheck2 className="w-3 h-3" />
        };
        break;
      case 'pending':
        statusProps = {
          className: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300',
          icon: <CalendarClock className="w-3 h-3" />
        };
        break;
      case 'joined':
        statusProps = {
          className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
          icon: <CalendarCheck2 className="w-3 h-3" />
        };
        break;
      case 'freelance':
        statusProps = {
          className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
          icon: <Smile className="w-3 h-3" />
        };
        break;
      case 'resigned':
      case 'contract_ended':
        statusProps = {
          className: 'bg-gray-100/50 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300/50',
          icon: <X className="w-3 h-3" />
        };
        break;
      default:
        statusProps = {
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: <Clock className="w-3 h-3" />
        };
    }

    return {
      ...base,
      ...statusProps,
      className: `${base.className} ${statusProps.className} relative`,
      // Add arrow connector after each status except the last one
      connector: index < total - 1 ? (
        <div className="relative h-full flex items-center px-1">
          <div className="w-2 h-px bg-gray-300 dark:bg-gray-600"></div>
          <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 -ml-1 flex-shrink-0" />
        </div>
      ) : null
    };
  };
  // Function to render the company logo or fallback
  const renderLogo = () => {
    // First try to use the logo URL if it exists and is valid
    if (exp.logo && typeof exp.logo === 'string' && exp.logo.trim() !== '') {
      return (
        <Image 
          src={exp.logo.trim()} 
          alt={`${exp.company} logo`}
          width={40}
          height={40}
          className="object-contain w-10 h-10"
          unoptimized={true}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.logo-fallback');
            if (fallback) {
              (fallback as HTMLElement).style.display = 'flex';
            }
          }}
        />
      );
    }
    
    // Then try to use the company URL to generate a logo
    if (exp.companyUrl && typeof exp.companyUrl === 'string' && exp.companyUrl.trim() !== '') {
      try {
        const url = new URL(exp.companyUrl.trim());
        const logoUrl = `https://logo.clearbit.com/${url.hostname}`;
        
        return (
          <Image 
            src={logoUrl}
            alt={`${exp.company} logo`}
            width={40}
            height={40}
            className="object-contain w-10 h-10"
            unoptimized={true}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.logo-fallback');
              if (fallback) {
                (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
        );
      } catch (e) {
        // If URL parsing fails, return null to use fallback
      }
    }
    
    // Return null to use the fallback div that's always present
    return null;
  };
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="relative flex group">
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/20 to-purple-400/20 dark:from-blue-500/20 dark:to-purple-500/20 ml-6"></div>
      
      {/* Timeline dot */}
      <div className="absolute left-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 -translate-x-1/2 z-10 flex items-center justify-center">
        <div className="w-3 h-3 bg-white dark:bg-gray-50 rounded-full"></div>
      </div>

      <div className="ml-12 w-full">
        {/* Date for mobile */}
        <div className="md:hidden text-sm text-gray-600 dark:text-gray-400 mb-2">
          {exp.startDate} - {exp.endDate}
        </div>

        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ y: -2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/10">
                {renderLogo()}
                <div className="logo-fallback w-full h-full hidden items-center justify-center">
                  <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exp.role}</h3>
                  <div className="flex items-center">
                    {exp.status?.map((status, i, arr) => {
                      const { className, icon, text, connector } = getStatusBadgeProps(status, i, arr.length);
                      return (
                        <div key={`${exp.id}-status-${i}`} className="flex items-center">
                          <div 
                            className={`${className} flex items-center gap-1`}
                            title={text}
                          >
                            {icon}
                            <span className="hidden sm:inline">{text}</span>
                          </div>
                          {connector}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-3.5 h-3.5" />
                    {exp.location}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Date for desktop */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-1.5">
              <Calendar className="w-4 h-4" />
              <span>{exp.startDate} - {exp.endDate}</span>
            </div>
            
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
          
          <motion.div 
            className="overflow-hidden"
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, marginTop: isExpanded ? '1rem' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-4 border-t border-gray-100 dark:border-white/5">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                {exp.description.map((item, i) => (
                  <li key={`${exp.id}-desc-${i}`} className="flex items-start gap-2">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {exp.skills.map((skill, i) => (
                  <SkillBadge 
                    key={`${exp.id}-skill-${i}-${skill.replace(/\s+/g, '-')}`}
                    skill={skill}
                    className="text-xs border transition-colors"
                  />
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
        console.log('Fetched experiences:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('Setting experiences with data:', data.map(d => ({
            id: d.id,
            company: d.company,
            status: d.status,
            hasStatus: 'status' in d
          })));
          setExperiences(data);
        } else {
          throw new Error('No experience data found');
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
    <section id="experience" className="py-16 md:py-24 bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 mb-4">
            Work Experience
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            My professional journey and the companies I've worked with
          </p>
        </motion.div>

        <div className="relative">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
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
        </div>
      </div>
    </section>
  );
}