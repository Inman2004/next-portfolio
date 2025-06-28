export type ExperienceStatus = 'interview' | 'issued_offer' | 'pending' | 'joined' | 'working' | 'resigned' | 'break' | 'contract_ended' | 'freelance';


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
  status: ExperienceStatus[];
}

export const experiences: ExperienceType[] = [
  // {
  //   id: 1,
  //   role: 'Full Stack Developer',
  //   company: 'Mann Hospitality',
  //   companyUrl: 'https://mannhospitality.com/',
  //   location: 'Bengaluru, India',
  //   startDate: 'May 2025',
  //   endDate: 'Present',
  //   description: [
  //     'Not started yet',
  //     'Planning to start soon'
  //   ],
  //   skills: ['Next.js', 'React', 'Node.js', 'TypeScript', 'TailwindCSS', 'MongoDB', 'Docker', 'AWS', 'CI/CD', 'RESTful APIs'],
  //   status: ['interview', 'issued_offer', 'pending'],
  // },
  {
    id: 1,
    role: 'Indie Web Developer',
    company: 'Self-Employed',
    companyUrl: 'https://rvinman2004.vercel.app',
    logo: 'https://i.ibb.co/DH4vWyxx/favicon.png',
    location: 'Tamil Nadu, India',
    startDate: 'Dec 2024',
    endDate: 'Present',
    description: [
      'Designed and developed 10+ full-stack applications from concept to deployment, including a movie database and AI-powered interview platform',
      'Built responsive UIs with React and Next.js, achieving 95+ Lighthouse performance scores',
      'Implemented authentication systems using NextAuth.js and JWT, handling 1000+ monthly active users',
      'Optimized applications for SEO and performance, resulting in 60% faster page loads',
      'Managed VPS deployments and configured CI/CD pipelines using GitHub Actions'
    ],
    skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'MongoDB', 'PostgreSQL', 'Vercel', 'Docker', 'GitHub Actions', 'RESTful APIs'],
    status: ['freelance', 'working']
  },
  {
    id: 2,
    role: '3D Artist',
    company: 'Freelancer',
    companyUrl: 'https://linkedin.com/in/rv3d',
    logo: 'https://i.ibb.co/jkjGPfC6/teddy.png',
    location: 'Remote',
    startDate: 'Jun 2022',
    endDate: 'Dec 2024',
    description: [
      'Created 3D models and animations for various projects',
      'Used Blender and other 3D modeling software to create realistic and engaging models',
    ],
    skills: ['Blender', '3D Anatomy', '3D Product Visualization', '3D Character Design', '3D printing',],
    status: ['freelance', 'contract_ended', 'break']
  },
  {
    id: 3,
    role: 'Open Source Contributor',
    company: 'GitHub',
    companyUrl: 'https://github.com/Inman2004',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Github-desktop-logo-symbol.svg/2048px-Github-desktop-logo-symbol.svg.png',
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
    skills: ['Open Source', 'Git', 'GitHub', 'TypeScript', 'React', 'Documentation'],
    status: ['contract_ended', 'break'],
  },
];
