import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Instagram, Heart } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: Github, href: 'https://github.com/Inman2004', label: 'GitHub' , color: 'text-gray-400 hover:text-purple-600 transition-all transform hover:scale-110'},
    { icon: Linkedin, href: 'https://linkedin.com/in/rv3d', label: 'LinkedIn' , color: 'text-gray-400 hover:text-blue-600 transition-all transform hover:scale-110'},
    { icon: Twitter, href: 'https://twitter.com/rvimman_', label: 'Twitter' , color: 'text-gray-400 hover:text-blue-400 transition-all transform hover:scale-110'},
    { icon: Instagram, href: 'https://instagram.com/rv_imman', label: 'Instagram' , color: 'text-gray-400 hover:text-pink-600 transition-all transform hover:scale-110'},
  ];

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#skills', label: 'Skills' },
    { href: '#services', label: 'Services' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' },
    { href: '#experience', label: 'Experience' },
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-black to-gray-900 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-800">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Immanuvel
            </h3>
            <p className="text-gray-400 max-w-xs">
              Crafting digital experiences with passion and precision.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <nav className="flex flex-row space-x-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Connect</h4>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={link.color}
                >
                  <link.icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" /> by Immanuvel
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © {currentYear} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 