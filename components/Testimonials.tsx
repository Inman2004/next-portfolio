import { cn } from "@/lib/utils";
import { InlineMarquee } from "@/components/magicui/marquee";
import Image from "next/image";
import { motion } from 'framer-motion';

const awards = [
  {
    name: "Full Stack Developer",
    provider: "@OneRoadMap",
    body: "Completed Full Course on Full Stack Development Conducted by OneRoadMap",
    img: "/images/docs/fullstack.png",
  },
  {
    name: "React.js developer",
    provider: "@OneRoadMap",
    body: "Completed Full Course on React Conducted by OneRoadMap",
    img: "/images/docs/react.png",
  },
  {
    name: "UI/UX Design",
    provider: "@Growth School",
    body: "Completed Full Course on UI/UX Conducted by Anudeep Ayyagari",
    img: "/images/docs/ux.png",
  },
  {
    name: "Big Data",
    provider: "@Infosys",
    body: "Completed Full Course on Big Data Conducted by Infosys",
    img: "/images/docs/bd201.jpg",
  },
  {
    name: "Internship",
    provider: "@InfoTech",
    body: "Attended Internship at InfoTech during 2023",
    img: "/images/docs/internship.png",
  },
  {
    name: "Frontend Developer",
    provider: "@OneRoadMap",
    body: "Completed Full Course on Frontend Development Conducted by OneRoadMap",
    img: "/images/docs/frontend.png",
  },
];

const firstRow = awards.slice(0, awards.length / 2);
const secondRow = awards.slice(awards.length / 2);

const ReviewCard = ({
  img,
  name,
  provider,
  body,
}: {
  img: string;
  name: string;
  provider: string;
  body: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group h-full"
    >
      <figure
        className={cn(
          "relative h-full w-fit flex flex-col items-center gap-2 cursor-pointer overflow-hidden rounded-xl border p-4",
          "bg-white dark:bg-gray-900/80 dark:backdrop-blur-sm",
          "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
        )}
      >
        <div className="flex flex-row items-center gap-2">
          <Image className="rounded" width="300" height="300" alt="" src={img} />
          <div className="flex flex-col w-full">
            <figcaption className="text-sm font-medium text-gray-900 dark:text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium text-gray-500 dark:text-white/40">{provider}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm text-gray-600 dark:text-gray-300">{body}</blockquote>
      </figure>
    </motion.div>
  );
};

export default function Testimonials() {
  return (
    <div id="testimonials" className="py-16 -mt-20 pt-32 bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center justify-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
          Certifications
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          This showcase my certifications and skills.
        </p>
      </div>
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden mb-20">
        <div className="w-full">
          <InlineMarquee pauseOnHover className="[--duration:60s] py-4">
            {firstRow.map((award, index) => (
              <ReviewCard key={`${award.name}-${index}`} {...award} />
            ))}
          </InlineMarquee>
          <InlineMarquee reverse pauseOnHover className="[--duration:60s] py-4">
            {secondRow.map((award, index) => (
              <ReviewCard key={`${award.name}-${index}-2`} {...award} />
            ))}
          </InlineMarquee>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent dark:from-black z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white to-transparent dark:from-black z-10"></div>
      </div>
    </div>
  );
}
