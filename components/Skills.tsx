import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { SkillBadge, getTechColor } from '@/components/skillColors';
import React from 'react';

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
      <div className="h-full rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-gray-900/20">
        <div className="p-6 md:p-8 space-y-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
            {skill.category}
          </h3>
          <div className="space-y-5">
            {skill.items.map((item, itemIndex) => (
              <div key={itemIndex} className="space-y-2">
                <div className="flex justify-between items-center">
                  <SkillBadge skill={item.name} className="text-sm">
                    {item.name}
                    <span className="ml-1 text-xs opacity-80 dark:opacity-70">{item.level}%</span>
                  </SkillBadge>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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
    <section id="skills" className="py-16 -mt-20 pt-32 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
            Skills & Expertise
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Here are the technologies and tools I specialize in, developed through years of hands-on experience
            and continuous learning.
          </p>
        </motion.div>

        <div className="px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {skills.map((skill, index) => (
              <SkillCard key={index} skill={skill} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills; 