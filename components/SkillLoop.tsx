import LogoLoop from './LogoLoop';
import { 
  SiReact, 
  SiNextdotjs, 
  SiTypescript, 
  SiTailwindcss, 
  SiNodedotjs,
  SiMongodb,
  SiPostgresql,
  SiPrisma,
  SiSupabase,
  SiVercel,
  SiGit,
  SiGithub,
  SiDocker,
  SiAmazonaws,
  SiFirebase,
  SiFramer,
  SiJavascript,
  SiHtml5,
  SiCss3,
  SiPython,
  SiExpress,
  SiJest,
  SiVitest,
  SiWebpack,
  SiEslint,
  SiPrettier
} from 'react-icons/si';

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiNodedotjs />, title: "Node.js", href: "https://nodejs.org" },
  { node: <SiJavascript />, title: "JavaScript", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  { node: <SiHtml5 />, title: "HTML5", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
  { node: <SiCss3 />, title: "CSS3", href: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
  { node: <SiPython />, title: "Python", href: "https://python.org" },
  { node: <SiMongodb />, title: "MongoDB", href: "https://mongodb.com" },
  { node: <SiPostgresql />, title: "PostgreSQL", href: "https://postgresql.org" },
  { node: <SiPrisma />, title: "Prisma", href: "https://prisma.io" },
  { node: <SiSupabase />, title: "Supabase", href: "https://supabase.com" },
  { node: <SiExpress />, title: "Express.js", href: "https://expressjs.com" },
  { node: <SiFirebase />, title: "Firebase", href: "https://firebase.google.com" },
  { node: <SiVercel />, title: "Vercel", href: "https://vercel.com" },
  { node: <SiGit />, title: "Git", href: "https://git-scm.com" },
  { node: <SiGithub />, title: "GitHub", href: "https://github.com" },
  { node: <SiDocker />, title: "Docker", href: "https://docker.com" },
  { node: <SiAmazonaws />, title: "AWS", href: "https://aws.amazon.com" },
  { node: <SiFramer />, title: "Framer Motion", href: "https://framer.com/motion" },
  { node: <SiJest />, title: "Jest", href: "https://jestjs.io" },
  { node: <SiVitest />, title: "Vitest", href: "https://vitest.dev" },
  { node: <SiWebpack />, title: "Webpack", href: "https://webpack.js.org" },
  { node: <SiEslint />, title: "ESLint", href: "https://eslint.org" },
  { node: <SiPrettier />, title: "Prettier", href: "https://prettier.io" },
];

// Alternative with image sources
const imageLogos = [
  { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
  { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
  { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

export default function SkillLoop() {
  return (
    <>
    <section id="skills" className="py-16 -mt-20 pt-32 bg-transparent">
        <div className="max-w-7xl mx-auto">
            <p className="text-lg sm:text-2xl text-center text-zinc-600 dark:text-zinc-300 max-w-4xl mx-auto">
                Here are the technologies and tools I specialize in, developed through years of hands-on experience
                and continuous learning.
            </p>
        </div>
    </section>
    <div style={{ height: '400px', position: 'relative', overflow: 'hidden'}}>
      <LogoLoop
        logos={techLogos}
        speed={90}
        direction="left"
        logoHeight={64}
        gap={40}
        pauseOnHover
        scaleOnHover
        fadeOut
        className="[--logoloop-fadeColorAuto:#fefefe] dark:[--logoloop-fadeColorAuto:#0a0a0a]"
        ariaLabel="Technology skills and tools"
      />
    </div>
    </>
  );
}