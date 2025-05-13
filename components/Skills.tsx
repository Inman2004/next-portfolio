import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

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
      { name: "HTML", level: 90 },
      { name: "CSS", level: 85 },
      { name: "JavaScript", level: 80 },
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
    category: "DevOps & Services",
    items: [
      { name: "Figma", level: 85 },
      { name: "Git", level: 80 },
      { name: "Postman", level: 85 },
      { name: "Docker", level: 70 },
      { name: "Vercel", level: 65 },
      { name: "AWS", level: 60 },
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
                  <span className="text-lg text-gray-300 font-medium">{item.name}</span>
                  <span className="text-gray-400">{item.level}%</span>
                </div>
                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${item.level}%` } : { width: 0 }}
                    transition={{ delay: index * 0.2 + itemIndex * 0.1, duration: 1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
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
        className="text-center space-y-6 mb-16"
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