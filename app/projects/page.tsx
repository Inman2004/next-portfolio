import Projects from '@/components/Projects';

export const metadata = {
  title: 'Projects | Rv Imman',
  description: 'Explore my portfolio of web development projects',
};

export default function ProjectsPage() {
  return (
    <>
    <main className="container bg-zinc-100 dark:bg-zinc-950 mx-auto px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
      <div className="relative py-2 md:py-4">
            <span 
              className="absolute inset-0 mx-auto flex items-center justify-center w-full blur-xl opacity-70 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 bg-clip-text text-5xl md:text-7xl font-extrabold text-transparent pointer-events-none"
              aria-hidden="true"
            >
              MyProjects
            </span>
            <h1 
              className="relative z-10 text-4xl md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 p-2 text-center"
            >
              My Projects
            </h1>
          </div>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-12 text-center max-w-2xl mx-auto">
          A collection of my recent work and side projects. Each project comes with a detailed case study.
        </p>
        <Projects showAll={true} />
      </div>
    </main>
    </>
  );
}
