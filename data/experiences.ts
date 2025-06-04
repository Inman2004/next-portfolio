export interface ExperienceType {
  id: number;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
  skills: string[];
  logo?: string;
}

export const experiences: ExperienceType[] = [
  {
    id: 1,
    role: 'Full Stack Developer',
    company: 'Mann Hospitality',
    companyUrl: 'https://mannhospitality.com/',
    location: 'Bengaluru, India',
    startDate: 'May 2025',
    endDate: 'Present',
    description: [
      'Developed and maintained responsive web applications using Next.js and React, improving user engagement by 40%',
      'Implemented server-side rendering (SSR) and static site generation (SSG) to enhance performance and SEO',
      'Collaborated with cross-functional teams to design and implement new features using TypeScript and Node.js',
      'Optimized database queries and API endpoints, reducing average response time by 35%',
      'Containerized applications using Docker and deployed them on AWS infrastructure'
    ],
    skills: ['Next.js', 'React', 'Node.js', 'TypeScript', 'TailwindCSS', 'MongoDB', 'Docker', 'AWS', 'CI/CD', 'RESTful APIs'],
  },
  {
    id: 2,
    role: 'Indie Web Developer',
    company: 'Self-Employed',
    companyUrl: 'https://rvimman.vercel.app',
    location: 'Tamil Nadu, India',
    startDate: 'Jun 2022',
    endDate: 'Dec 2024',
    description: [
      'Designed and developed 10+ full-stack applications from concept to deployment, including a movie database and AI-powered interview platform',
      'Built responsive UIs with React and Next.js, achieving 95+ Lighthouse performance scores',
      'Implemented authentication systems using NextAuth.js and JWT, handling 1000+ monthly active users',
      'Optimized applications for SEO and performance, resulting in 60% faster page loads',
      'Managed VPS deployments and configured CI/CD pipelines using GitHub Actions'
    ],
    skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'MongoDB', 'PostgreSQL', 'Vercel', 'Docker', 'GitHub Actions', 'RESTful APIs'],
  },
  {
    id: 3,
    role: 'Open Source Contributor',
    company: 'GitHub',
    companyUrl: 'https://github.com/Inman2004',
    location: 'Remote',
    startDate: 'Jan 2021',
    endDate: 'Present',
    description: [
      'Contributed to 5+ open source projects, including bug fixes and feature implementations',
      'Submitted 20+ pull requests with 100% acceptance rate',
      'Improved documentation and added TypeScript types to enhance developer experience',
      'Collaborated with maintainers to review code and improve project architecture',
      'Contributed to various open source projects on GitHub',
      'Fixed bugs and implemented new features',
      'Documented code and improved project documentation',
    ],
    skills: ['Git', 'GitHub', 'Open Source', 'Documentation'],
  },
];
