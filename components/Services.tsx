import { motion } from 'framer-motion';
import { Code2, Palette, Globe, Rocket, Smartphone, Server } from 'lucide-react';

const services = [
  {
    title: 'Web Development',
    description: 'Building responsive and dynamic websites using modern technologies like React, Next.js, and TypeScript.',
    icon: Globe,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Mobile Development',
    description: 'Creating cross-platform mobile applications using React Native and native technologies.',
    icon: Smartphone,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'UI/UX Design',
    description: 'Designing intuitive and beautiful user interfaces with a focus on user experience.',
    icon: Palette,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: 'Backend Development',
    description: 'Building scalable server-side applications and APIs using Node.js and modern frameworks.',
    icon: Server,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Custom Software',
    description: 'Developing tailored software solutions to meet specific business needs and requirements.',
    icon: Code2,
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    title: 'DevOps & Deployment',
    description: 'Setting up CI/CD pipelines and managing cloud infrastructure for seamless deployment.',
    icon: Rocket,
    gradient: 'from-indigo-500 to-purple-500'
  }
];

export default function Services() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950" id="services">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent mb-4"
          >
            Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 text-center max-w-2xl"
          >
            Comprehensive solutions tailored to your needs. From web development to deployment, I&apos;ve got you covered.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  } 
                }}
                whileHover={{
                  y: -8,
                  transition: { 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
                viewport={{ once: true, margin: "-50px" }}
                className="group relative"
              >
                <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 h-full border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:border-blue-100 dark:hover:border-gray-600/50 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-purple-500/20">
                  <motion.div 
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.gradient} p-2 mb-6`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <Icon className="w-full h-full text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 