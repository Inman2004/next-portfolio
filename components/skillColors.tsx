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
  if (techLower.includes('node')) return { bg: 'bg-lime-500/10', text: 'text-lime-400', gradient: 'from-lime-500 to-lime-600', border: 'border-lime-400', hover: 'hover:bg-lime-500/20' };
  
  // Frontend
  if (techLower.includes('react')) return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-600', border: 'border-cyan-400', hover: 'hover:bg-cyan-500/20' };
  if (techLower.includes('next') || techLower.includes('next.js')) return { bg: 'bg-zinc-500/10 dark:bg-white/10', text: 'text-zinc-200 dark:text-white', gradient: 'from-zinc-500 to-zinc-600', border: 'border-zinc-400', hover: 'hover:bg-zinc-500/20' };
  if (techLower.includes('typescript') || techLower.includes('ts')) return { bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', hover: 'hover:bg-blue-500/20' };
  if (techLower.includes('tailwind')) return { bg: 'bg-sky-500/10', text: 'text-sky-400', gradient: 'from-sky-500 to-sky-600', border: 'border-sky-400', hover: 'hover:bg-sky-500/20' };
  if (techLower.includes('html')) return { bg: 'bg-orange-500/10', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('css')) return { bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', hover: 'hover:bg-blue-500/20' };
  if (techLower.includes('javascript') || techLower.includes('js')) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  
  // Backend
  if (techLower.includes('python')) return { bg: 'bg-amber-500/10', text: 'text-amber-400', gradient: 'from-amber-500 to-amber-600', border: 'border-amber-400', hover: 'hover:bg-amber-500/20' };
  if (techLower.includes('mongo')) return { bg: 'bg-green-500/10', text: 'text-green-400', gradient: 'from-green-500 to-green-600', border: 'border-green-400', hover: 'hover:bg-green-500/20' };
  if (techLower.includes('mysql')) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('firebase')) return { bg: 'bg-orange-500/10', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('express')) return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', gradient: 'from-indigo-500 to-indigo-600', border: 'border-indigo-400', hover: 'hover:bg-indigo-500/20' };
  if (techLower.includes('flask')) return { bg: 'bg-pink-500/10', text: 'text-pink-400', gradient: 'from-pink-500 to-pink-600', border: 'border-pink-400', hover: 'hover:bg-pink-500/20' };
  
  // DevOps & Services
  if (techLower.includes('figma')) return { bg: 'bg-purple-500/10', text: 'text-purple-400', gradient: 'from-purple-500 to-purple-600', border: 'border-purple-400', hover: 'hover:bg-purple-500/20' };
  if (techLower.includes('git')) return { bg: 'bg-rose-500/10', text: 'text-rose-400', gradient: 'from-rose-500 to-rose-600', border: 'border-rose-400', hover: 'hover:bg-rose-500/20' };
  if (techLower.includes('postman')) return { bg: 'bg-orange-500/10', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600', border: 'border-orange-400', hover: 'hover:bg-orange-500/20' };
  if (techLower.includes('docker')) return { bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', hover: 'hover:bg-blue-500/20' };
  if (techLower.includes('vercel')) return { bg: 'bg-zinc-700/10 dark:bg-white/10', text: 'text-zinc-400 dark:text-white', gradient: 'from-black to-zinc-700 dark:from-white dark:to-zinc-300', border: 'border-zinc-400', hover: 'hover:bg-zinc-500/20' };
  if (techLower.includes('aws')) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-400', hover: 'hover:bg-yellow-500/20' };
  if (techLower.includes('llm')) return { bg: 'bg-sky-500/10', text: 'text-sky-400', gradient: 'from-sky-500 to-sky-600', border: 'border-sky-400', hover: 'hover:bg-sky-500/20' };
  
  // Default
  return { bg: 'bg-gray-500/10', text: 'text-gray-400', gradient: 'from-gray-500 to-gray-600', border: 'border-gray-400', hover: 'hover:bg-gray-500/20' };
};

interface SkillBadgeProps {
  skill: string;
  className?: string;
  children?: React.ReactNode;
}

// Component for rendering a skill badge
export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, className = '', children }) => {
  const { bg, text, border, hover } = getTechColor(skill);
  
  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bg} ${text} ${border} ${hover} ${className}`}
    >
      {children || skill}
    </span>
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
