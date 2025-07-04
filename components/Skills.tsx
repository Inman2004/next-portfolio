import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { SkillBadge, getTechColor } from '@/components/skillColors';
import React, { useMemo } from 'react';

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
      { name: "JavaScript", level: 95 },
    ]
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", level: 80 },
      { name: "Python", level: 50 },
      { name: "MongoDB", level: 80 },
      { name: "MySQL", level: 70 },
      { name: "Firebase", level: 90 },
      { name: "Express", level: 85 },
      { name: "Flask", level: 40 },
    ]
  },
  {
    category: "DevOps & Tools",
    items: [
      { name: "Figma", level: 65 },
      { name: "Git", level: 80 },
      { name: "Postman", level: 85 },
      { name: "Docker", level: 40 },
      { name: "Vercel", level: 95 },
      { name: "LLMs & AI Integration", level: 40 },
    ]
  }
];

const SkillCard = React.memo(({ skill, index }: { skill: Skill; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });
  const prefersReducedMotion = useReducedMotion();
  const gradient = useMemo(() => getTechColor('').gradient, []);

  // Memoize the skill items to prevent unnecessary re-renders
  const skillItems = useMemo(() => {
    return skill.items.map((item) => ({
      ...item,
      color: getTechColor(item.name).gradient || gradient
    }));
  }, [skill.items, gradient]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: prefersReducedMotion ? 0 : i * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  const barVariants = {
    hidden: { width: 0 },
    visible: (level: number) => ({
      width: `${level}%`,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2
      }
    })
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={index}
      variants={containerVariants}
      className="h-full"
    >
      <div className="h-full rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-gray-900/20">
        <div className="p-6 md:p-8 space-y-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
            {skill.category}
          </h3>
          <div className="space-y-5">
            {skillItems.map((item, itemIndex) => (
              <div key={`${item.name}-${itemIndex}`} className="space-y-2">
                <div className="flex justify-between items-center">
                  <SkillBadge skill={item.name} className="text-sm">
                    {item.name}
                    <span className="ml-1 text-xs opacity-80 dark:opacity-70">{item.level}%</span>
                  </SkillBadge>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    variants={barVariants}
                    custom={item.level}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                    aria-valuenow={item.level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const Skills = () => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '0px 0px -50px 0px' });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section id="skills" className="py-16 -mt-20 pt-32 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
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

        <motion.div 
          ref={containerRef}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="px-4 sm:px-6 lg:px-8 mt-12 md:mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {skills.map((skill, index) => (
              <SkillCard key={`${skill.category}-${index}`} skill={skill} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills; 