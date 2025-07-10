interface TechColor {
  bg: string;
  text: string;
  gradient: string;
  border: string;
  hover: string;
}

// Technology to color mapping
export const getTechColor = (tech: string): TechColor => {
  const techLower = tech.toLowerCase();
  
  // Backend - Check these first to avoid conflicts with frontend techs
  if (techLower.includes('node')) return { bg: 'bg-lime-500/15', text: 'text-lime-600 dark:text-lime-400', gradient: 'from-lime-500 to-lime-600', border: 'border-lime-400', hover: 'hover:bg-lime-500/20' };
  
  // Frontend
  if (techLower.includes('framer') || techLower.includes('framer-motion')) return { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-500 to-purple-600', border: 'border-purple-400', hover: 'hover:bg-purple-500/20' };
  if (techLower.includes('react')) return { bg: 'bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', gradient: 'from-cyan-500 to-cyan-600', border: 'border-cyan-400', hover: 'hover:bg-cyan-500/20' };
  if (techLower.includes('next') || techLower.includes('next.js')) return { bg: 'bg-zinc-700/10 dark:bg-white/10', text: 'text-zinc-700 dark:text-white', gradient: 'from-zinc-700 to-zinc-800 dark:from-white dark:to-zinc-300', border: 'border-zinc-500 dark:border-zinc-400', hover: 'hover:bg-zinc-500/20' };
  if (techLower.includes('typescript') || techLower.includes('ts')) return { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-500 dark:border-blue-400', hover: 'hover:bg-blue-500/20' };
  if (techLower.includes('tailwind')) return { bg: 'bg-sky-500/15', text: 'text-sky-600 dark:text-sky-400', gradient: 'from-sky-500 to-sky-600', border: 'border-sky-500 dark:border-sky-400', hover: 'hover:bg-sky-500/20' };
  if (techLower.includes('html')) return { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-500 dark:border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('css')) return { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-500 dark:border-blue-400', hover: 'hover:bg-blue-500/20' };
  if (techLower.includes('javascript') || techLower.includes('js')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  
  // Libraries
  if (techLower.includes('tensorflow')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('pytorch')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('keras')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('numpy')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('pandas')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('matplotlib')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('seaborn')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('scikit-learn')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };

  // Backend
  if (techLower.includes('vapi')) return { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400/50', hover: 'hover:bg-emerald-500/20' };
  if (techLower.includes('php')) return { bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', gradient: 'from-indigo-500 to-indigo-600', border: 'border-indigo-400', hover: 'hover:bg-indigo-500/20' };
  if (techLower.includes('laravel')) return { bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', gradient: 'from-red-500 to-red-600', border: 'border-red-400', hover: 'hover:bg-red-500/20' };
  if (techLower.includes('python')) return { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-500 to-amber-600', border: 'border-amber-500 dark:border-amber-400', hover: 'hover:bg-amber-500/20' };
  if (techLower.includes('mongo')) return { bg: 'bg-green-500/15', text: 'text-green-600 dark:text-green-400', gradient: 'from-green-500 to-green-600', border: 'border-green-500 dark:border-green-400', hover: 'hover:bg-green-500/20' };
  if (techLower.includes('mysql')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('firebase')) return { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-500 dark:border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('express')) return { bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-400', gradient: 'from-indigo-500 to-indigo-600', border: 'border-indigo-500 dark:border-indigo-400', hover: 'hover:bg-indigo-500/20' };
  if (techLower.includes('flask')) return { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400', gradient: 'from-pink-500 to-pink-600', border: 'border-pink-500 dark:border-pink-400', hover: 'hover:bg-pink-500/20' };
  
  // AI/ML & Data
  if (techLower.includes('openai') || techLower.includes('gpt')) return { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400', hover: 'hover:bg-emerald-500/20' };
  if (techLower.includes('langchain')) return { bg: 'bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', gradient: 'from-cyan-500 to-cyan-600', border: 'border-cyan-400', hover: 'hover:bg-cyan-500/20' };
  if (techLower.includes('pytorch')) return { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('tensorflow')) return { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('pandas')) return { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', hover: 'hover:bg-blue-500/20' };
  if (techLower.includes('numpy')) return { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', hover: 'hover:bg-blue-500/20' };

  // DevOps & Services
  if (techLower.includes('figma')) return { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-500 to-purple-600', border: 'border-purple-500 dark:border-purple-400', hover: 'hover:bg-purple-500/20' };
  if (techLower.includes('git')) return { bg: 'bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', gradient: 'from-rose-500 to-rose-600', border: 'border-rose-500 dark:border-rose-400', hover: 'hover:bg-rose-500/20' };
  if (techLower.includes('postman')) return { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-500 dark:border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('docker')) return { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-500 dark:border-blue-400', hover: 'hover:bg-blue-500/20' };
  if (techLower.includes('vercel')) return { bg: 'bg-zinc-900/10 dark:bg-white/10', text: 'text-zinc-900 dark:text-white', gradient: 'from-black to-zinc-700 dark:from-white dark:to-zinc-300', border: 'border-zinc-700 dark:border-zinc-400', hover: 'hover:bg-zinc-500/20' };
  if (techLower.includes('aws')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500 dark:border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('llm')) return { bg: 'bg-sky-500/15', text: 'text-sky-600 dark:text-sky-400', gradient: 'from-sky-500 to-sky-600', border: 'border-sky-500 dark:border-sky-400', hover: 'hover:bg-sky-500/20' };
  
  // Design & 3D
  if (techLower.includes('blender')) return { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-500 dark:border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('figma')) return { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-500 to-purple-600', border: 'border-purple-400', hover: 'hover:bg-purple-500/20' };
  if (techLower.includes('photoshop')) return { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', hover: 'hover:bg-blue-500/20' };
  if (techLower.includes('illustrator')) return { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-400', hover: 'hover:bg-orange-500/20' };

  // Misc
  // Default
  return { bg: 'bg-gray-500/15', text: 'text-gray-600 dark:text-gray-400', gradient: 'from-gray-500 to-gray-600', border: 'border-gray-500 dark:border-gray-400', hover: 'hover:bg-gray-500/20' };
};

interface SkillBadgeProps {
  skill: string;
  className?: string;
  children?: React.ReactNode;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

// Component for rendering a skill badge with hover underline for proficiency
export const SkillBadge: React.FC<SkillBadgeProps> = ({ 
  skill, 
  className = '', 
  children,
  proficiency 
}) => {
  const { bg, text, border, hover } = getTechColor(skill);
  
  // Color mapping for proficiency levels
  const proficiencyColor = {
    'Beginner': 'bg-blue-400',
    'Intermediate': 'bg-green-400',
    'Advanced': 'bg-purple-400',
    'Expert': 'bg-yellow-400'
  }[proficiency || 'Beginner'];
  
  // Width mapping for proficiency levels
  const proficiencyWidth = {
    'Beginner': 'w-1/4',
    'Intermediate': 'w-1/2',
    'Advanced': 'w-3/4',
    'Expert': 'w-full'
  }[proficiency || 'Beginner'];
  
  return (
    <div className="group relative inline-block">
      <div className="relative">
        <span 
          className={`inline-flex items-center px-3 py-1 rounded-full hover:rounded cursor-pointer text-sm font-medium ${bg} ${text} ${border} ${hover} ${className} transition-all duration-200`}
        >
          {children || skill}
        </span>
        {proficiency && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div 
              className={`absolute inset-0 ${proficiencyColor} transition-all duration-300 transform origin-left scale-x-0 group-hover:scale-x-100 ${proficiencyWidth} rounded-full`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface SkillBadgesProps {
  skills: string[];
  className?: string;
}

// Component for rendering a list of skill badges
export const SkillBadges: React.FC<SkillBadgesProps> = ({ skills, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {skills.map((skill, index) => (
        <SkillBadge key={index} skill={skill} />
      ))}
    </div>
  );
};
