'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MorphingText } from '@/components/magicui/morphing-text';
import { AuroraText } from "@/components/magicui/aurora-text";
import { 
  FaGithub,
  FaLinkedin,
  FaXTwitter
} from 'react-icons/fa6';
import { SiGmail } from 'react-icons/si';

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative w-full py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-pattern" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-500/5 to-purple-500/10" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 pt-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block"
            >
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/10 text-blue-300 mb-6 inline-block">
                Welcome to my portfolio
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Hi, I&apos;m <AuroraText>Immanuvel</AuroraText>
              </span>
            </h1>

            <div className="text-lg sm:text-xl md:text-2xl text-indigo-300 mb-8 h-[180px] flex items-center justify-center lg:justify-start">
              <MorphingText
                texts={[
                  "UI/UX Designer",
                  "Full Stack Developer",
                  "Graphic Designer",
                  "3D Artist"
                ]}
                className="text-center lg:text-left !h-[160px]"
              />
            </div>

            <p className="text-base sm:text-lg text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0">
              I craft beautiful, responsive, and user-friendly digital experiences 
              that combine creativity with technical excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-lg font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-blue-500/25 text-center"
              >
                View My Work
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-blue-500/30 rounded-lg text-lg font-medium hover:bg-blue-500/10 transition-all duration-300 text-center"
              >
                Get in Touch
              </motion.a>
            </div>

            {/* Social Links */}
            <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start">
              <motion.a
                href="https://github.com/Inman2004"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#a930d5] hover:opacity-80 transition-opacity"
              >
                <FaGithub className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/rv3d"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#0A66C2] hover:opacity-80 transition-opacity"
              >
                <FaLinkedin className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://twitter.com/rvimman_"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#fff] hover:opacity-80 transition-opacity"
              >
                <FaXTwitter className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="mailto:rvimman@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-[#cf594e] hover:opacity-80 transition-opacity"
              >
                <SiGmail className="w-6 h-6" />
              </motion.a>
            </div>
          </motion.div>

          {/* Right Content - 3D or Image Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex-1 relative w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]"
          >
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
              <div className="relative w-full h-full rounded-full overflow-hidden border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-purple-500/10">
                <Image 
                  src="/images/avatar.png" 
                  alt="Immanuvel" 
                  width={500} 
                  height={500} 
                  className="object-cover w-full h-full" 
                  priority
                />
                <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-purple-500/10 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-blue-500/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ height: ["20%", "80%", "20%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 bg-blue-500/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
} 