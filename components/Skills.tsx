import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

// Technology to color mapping
const getTechColor = (tech: string) => {
  const techLower = tech.toLowerCase();
  
  // Backend - Check these first to avoid conflicts with frontend techs
  if (techLower.includes('node')) return { bg: 'bg-lime-500/10', text: 'text-lime-400', gradient: 'from-lime-500 to-lime-600' };
  
  // Frontend
  if (techLower.includes('react')) return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-600' };
  if (techLower.includes('next') || techLower.includes('next.js')) return { bg: 'bg-zinc-500/10 dark:bg-white/10', text: 'text-zinc-200 dark:text-white', gradient: 'from-zinc-500 to-zinc-600' };
  if (techLower.includes('typescript') || techLower.includes('ts')) return { bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' };
  if (techLower.includes('tailwind')) return { bg: 'bg-sky-500/10', text: 'text-sky-400', gradient: 'from-sky-500 to-sky-600' };
  if (techLower.includes('html')) return { bg: 'bg-orange-500/10', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600' };
  if (techLower.includes('css')) return { bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' };
  if (techLower.includes('javascript') || techLower.includes('js')) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', gradient: 'from-yellow-500 to-yellow-600' };
  
  // Rest of Backend
  if (techLower.includes('python')) return { bg: 'bg-amber-500/10', text: 'text-amber-400', gradient: 'from-amber-500 to-amber-600' };
  if (techLower.includes('mongo')) return { bg: 'bg-green-500/10', text: 'text-green-400', gradient: 'from-green-500 to-green-600' };
  if (techLower.includes('mysql')) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', gradient: 'from-yellow-500 to-yellow-600' };
  if (techLower.includes('firebase')) return { bg: 'bg-orange-500/10', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600' };
  if (techLower.includes('express')) return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', gradient: 'from-indigo-500 to-indigo-600' };
  if (techLower.includes('flask')) return { bg: 'bg-pink-500/10', text: 'text-pink-400', gradient: 'from-pink-500 to-pink-600' };
  
  // DevOps & Services
  if (techLower.includes('figma')) return { bg: 'bg-purple-500/10', text: 'text-purple-400', gradient: 'from-purple-500 to-purple-600' };
  if (techLower.includes('git')) return { bg: 'bg-rose-500/10', text: 'text-rose-400', gradient: 'from-rose-500 to-rose-600' };
  if (techLower.includes('postman')) return { bg: 'bg-orange-500/10', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600' };
  if (techLower.includes('docker')) return { bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' };
  if (techLower.includes('vercel')) return { bg: 'bg-zinc-700/10 dark:bg-white/10', text: 'text-zinc-400 dark:text-white', gradient: 'from-black to-zinc-700 dark:from-white dark:to-zinc-300' };
  if (techLower.includes('aws')) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', gradient: 'from-yellow-500 to-yellow-600' };
  if (techLower.includes('llm')) return { bg: 'bg-sky-500/10', text: 'text-sky-400', gradient: 'from-sky-500 to-sky-600' };
  // Default
  return { bg: 'bg-gray-500/10', text: 'text-gray-400', gradient: 'from-gray-500 to-gray-600' };
};

interface Skill {
  category: string;
  items: {
    name: string;
    level: number;
    icon?: string;
  }[];
}

const skills: Skill[] = [
  {
    category: "Frontend",
    items: [
      { name: "React", level: 90 },
      { name: "Next.js", level: 85 },
      { name: "TypeScript", level: 80 },
      { name: "TailwindCSS", level: 85 },
      { name: "HTML", level: 95 },
      { name: "CSS", level: 95 },
      { name: "JavaScript", level: 85 },
    ]
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", level: 80 },
      { name: "Python", level: 75 },
      { name: "MongoDB", level: 80 },
      { name: "MySQL", level: 75 },
      { name: "Firebase", level: 90 },
      { name: "Express", level: 85 },
      { name: "Flask", level: 70 },
    ]
  },
  {
    category: "DevOps & Tools",
    items: [
      { name: "Figma", level: 85 },
      { name: "Git", level: 80 },
      { name: "Postman", level: 85 },
      { name: "Docker", level: 70 },
      { name: "Vercel", level: 65 },
      { name: "AWS", level: 60 },
      { name: "LLMs & AI", level: 50 },
    ]
  }
];

const SkillCard = ({ skill, index }: { skill: Skill; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.2, duration: 0.8 }}
      className="h-full"
    >
      <div className="h-full rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-800 hover:border-blue-500 transition-all duration-300">
        <div className="p-10 space-y-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            {skill.category}
          </h3>
          <div className="space-y-6">
            {skill.items.map((item, itemIndex) => (
              <div key={itemIndex} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-medium ${getTechColor(item.name).text}`}>
                    {item.name}
                  </span>
                  <span className={`${getTechColor(item.name).text} font-semibold`}>
                    {item.level}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${item.level}%` } : { width: 0 }}
                    transition={{ delay: index * 0.2 + itemIndex * 0.1, duration: 1 }}
                    className={`h-full bg-gradient-to-r ${getTechColor(item.name).gradient} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 my-16"
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Skills & Expertise
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Here are the technologies and tools I specialize in, developed through years of hands-on experience
          and continuous learning.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {skills.map((skill, index) => (
          <SkillCard key={index} skill={skill} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Skills; 