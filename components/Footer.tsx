import { motion as m } from 'framer-motion';
import { Github, Linkedin, Twitter, Instagram, Heart } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: Github, href: 'https://github.com/Inman2004', label: 'GitHub' , color: 'text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 transition-all transform hover:scale-110'},
    { icon: Linkedin, href: 'https://linkedin.com/in/rv3d', label: 'LinkedIn' , color: 'text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-all transform hover:scale-110'},
    { icon: Twitter, href: 'https://twitter.com/rvimman_', label: 'Twitter' , color: 'text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-all transform hover:scale-110'},
    { icon: Instagram, href: 'https://instagram.com/rv_imman', label: 'Instagram' , color: 'text-zinc-500 hover:text-pink-600 dark:text-zinc-400 dark:hover:text-pink-500 transition-all transform hover:scale-110'},
  ];

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900 pt-12 pb-6 border-t border-zinc-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-purple-600 bg-clip-text text-transparent">
              Immanuvel
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-xs">
              Crafting digital experiences with passion and precision.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-white">Quick Links</h4>
            <nav className="flex flex-row space-x-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="relative inline-block text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-white group"
                >
                  <span className="relative transition-all">
                    {link.label}
                    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-emerald-600 dark:bg-white transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-white">Connect</h4>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <m.a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={link.color}
                >
                  <link.icon className="w-6 h-6" />
                </m.a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 flex items-center justify-center gap-2">
            Made by Immanuvel B <u className="text-xs mt-1 text-emerald-600 dark:text-emerald-400">B.E, DCE</u>
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">
            &copy; {currentYear} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 