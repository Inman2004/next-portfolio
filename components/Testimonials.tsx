import { cn } from "@/lib/utils";
import { InlineMarquee } from "@/components/magicui/marquee";
import Image from "next/image";
import { motion } from 'framer-motion';
import { PopoverDemo } from "./CertificatePopover";

export const awards = [
  {
    name: "Full Stack Developer",
    provider: "OneRoadMap",
    body: "Mastered full-stack development including React, Node.js, Express, and MongoDB. Built multiple full-stack applications with authentication and database integration.",
    img: "/images/docs/fullstack.png",
    date: "2023",
    skills: ["React", "Node.js", "MongoDB", "Express", "REST APIs"]
  },
  {
    name: "React.js Developer",
    provider: "OneRoadMap",
    body: "Gained expertise in React.js, hooks, context API, and modern frontend development practices. Built responsive and interactive user interfaces.",
    img: "/images/docs/react.png",
    date: "2023",
    skills: ["React", "JavaScript", "Hooks", "Context API"]
  },
  {
    name: "UI/UX Design",
    provider: "Growth School",
    body: "Learned user-centered design principles, wireframing, and prototyping. Created intuitive and visually appealing user interfaces.",
    img: "/images/docs/ux.png",
    date: "2022",
    skills: ["Figma", "User Research", "Wireframing", "Prototyping"]
  },
  {
    name: "Big Data",
    provider: "Infosys",
    body: "Acquired knowledge in big data technologies including Hadoop, Spark, and data processing frameworks for handling large datasets.",
    img: "/images/docs/bd201.jpg",
    date: "2022",
    skills: ["Hadoop", "Spark", "Data Processing", "Big Data"]
  },
  {
    name: "Software Development Internship",
    provider: "InfoTech",
    body: "Worked on real-world projects, collaborated with a team, and gained hands-on experience in software development lifecycle.",
    img: "/images/docs/internship.png",
    date: "2023",
    skills: ["Teamwork", "Agile", "Problem Solving", "Development"]
  },
  {
    name: "Frontend Development",
    provider: "OneRoadMap",
    body: "Mastered modern frontend technologies including HTML5, CSS3, JavaScript, and responsive design principles.",
    img: "/images/docs/frontend.png",
    date: "2022",
    skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design"]
  },
];

export const firstRow = awards.slice(0, awards.length / 2);
export const secondRow = awards.slice(awards.length / 2);

interface ReviewCardProps {
  img: string;
  name: string;
  provider: string;
  body: string;
  date?: string;
  skills?: string[];
  index: number;
}

const ReviewCard = ({
  img,
  name,
  provider,
  body,
  date,
  skills = [],
  index
}: ReviewCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full px-1.5 py-2"
    >
      <div
        className={cn(
          "relative h-full flex flex-col overflow-hidden rounded-xl border p-5",
          "bg-gray-50 ring-1 dark:ring-gray-700 dark:bg-gray-900/80 dark:backdrop-blur-sm",
          "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500/50",
          "transition-all duration-300 shadow-sm hover:shadow-lg group/card"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Image 
                src={img} 
                alt={`${name} certification`} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                  {name}
                </h3>
                {date && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    {date}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                {provider}
              </p>
            </div>
          </div>
          <div className="w-full max-w-[16rem]">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {body}
            </p>
          </div>
          
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          <PopoverDemo index={index} />
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover/card:opacity-100 dark:from-blue-900/10 dark:to-purple-900/10 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 -mt-20 pt-32 bg-white rounded-lg dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
            Certifications & Courses
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            A showcase of my professional certifications and the skills I've acquired through dedicated learning and hands-on experience.
          </p>
        </motion.div>

        <div className="relative">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <InlineMarquee 
                pauseOnHover 
                className="[--duration:40s] py-4"
              >
                {firstRow.map((award, index) => (
                  <div key={`${award.name}-${index}`} className="px-2">
                    <ReviewCard {...award} index={index} />
                  </div>
                ))}
              </InlineMarquee>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6"
            >
              <InlineMarquee 
                reverse 
                pauseOnHover 
                className="[--duration:45s] py-4"
              >
                {secondRow.map((award, index) => (
                  <div key={`${award.name}-${index}-2`} className="px-2">
                    <ReviewCard {...award} index={index + firstRow.length} />
                  </div>
                ))}
              </InlineMarquee>
            </motion.div>
          </div>
          
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10"></div>
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click view certificate to see more
          </p>
        </motion.div>
      </div>
    </section>
  );
}
