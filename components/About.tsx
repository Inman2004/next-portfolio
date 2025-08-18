import { motion } from 'framer-motion';
import Image from 'next/image';

const About = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full lg:w-1/2 space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              About Me
            </h2>
            <div className="space-y-4">
              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                I am a passionate developer and designer with a keen eye for detail and a love for creating
                beautiful, functional web experiences. My journey in tech has led me to master various
                technologies and frameworks, allowing me to bring creative visions to life.
              </p>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                With a strong foundation in both front-end and back-end development, I specialize in
                creating responsive, user-friendly applications that deliver exceptional user experiences.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base flex-1 text-center"
              >
                Download CV
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border border-blue-600 rounded-lg hover:bg-blue-600/10 transition-colors text-sm md:text-base flex-1 text-center"
              >
                Contact Me
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative aspect-square max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-2xl transform -rotate-6 transition-transform group-hover:rotate-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/25 to-purple-500/25 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-0" /> 

              <h3 className="text-2xl font-bold text-center text-gray-300">Stunning UI & Custom Themes</h3>
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-800">

                <Image src="/images/ui.png" alt="Web UI" width={400} height={300} className="object-cover rounded-2xl mx-auto" />

                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default About; 