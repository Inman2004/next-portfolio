"use client"
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, User, HomeIcon, Settings, Rss } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShineBorder } from './magicui/shine-border';

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const isAnchor = href.startsWith('#');
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAnchor) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without page reload
        window.history.pushState({}, '', `${window.location.pathname}${href}`);
      }
    }
  };

  return (
    <li className="text-center md:text-left">
      <Link
        href={href}
        onClick={handleClick}
        className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10 block w-full md:w-auto"
        scroll={!isAnchor} // Disable Next.js default scroll behavior for anchor links
      >
        {children}
      </Link>
    </li>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/30 h-20">
      
      <nav className="max-w-[1400px] h-full mx-auto px-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
        ><ShineBorder />
          <Link href="/" >
            Immanuvel.<span className='text-white text-xl'>dev</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* Navigation Links */}
          <ul
            className={`${
              menuOpen ? 'block' : 'hidden'
            } absolute top-20 left-0 w-full bg-black/90 md:bg-transparent md:static md:flex md:items-center md:space-x-2 transition-all duration-300 ease-in-out`}
          >
            {isHome ? (
              <div className="flex flex-col md:flex-row md:items-center w-full md:w-auto">
                <ul className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-1 w-full md:w-auto">
                  <NavItem href="#home">Home</NavItem>
                  <NavItem href="#projects">Projects</NavItem>
                  <NavItem href="#skills">Skills</NavItem>
                  <NavItem href="#experience">Experience</NavItem>
                  <NavItem href="#services">Services</NavItem>
                  <NavItem href="#testimonials">Testimonials</NavItem>
                  <NavItem href="#contact">Get in touch</NavItem>
                  <NavItem href="/blog">
                    <div className="relative group">
                      <span className="text-blue-600 hover:text-blue-300 transition-colors px-4 py-2 rounded-lg block text-center">
                        <Rss className="w-5 h-5" />
                      </span>
                      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full mt-4 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Go to Blog
                        <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 -rotate-45 -top-1"></div>
                      </div>
                    </div>
                  </NavItem>
                </ul>
              </div>
            ) : (
              <div className="w-full md:w-auto">
                <NavItem href="/">
                  <div className="flex items-center justify-center md:justify-start">
                    <HomeIcon className="w-5 h-5 mr-2" />
                    <span>Back to Home</span>
                  </div>
                </NavItem>
              </div>
            )}
          </ul>

          {/* User Authentication */}
          {!user ? (
            <ul
              className={`${
                menuOpen ? 'block' : 'hidden'
              } absolute top-20 left-0 w-full bg-black/90 md:bg-transparent md:static md:flex md:items-center md:space-x-2 transition-all duration-300 ease-in-out`}
            >
              <NavItem href="/signin">
                <span className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg block text-center">
                  Sign&nbsp;In
                </span>
              </NavItem>
              <NavItem href="/signup">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity block text-center">
                  Sign&nbsp;Up
                </span>
              </NavItem>
            </ul>
          ) : (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.email || 'User avatar'}
                    className="w-full h-full rounded-full object-cover"
                    width={32}
                    height={32}
                    priority
                    quality={100}
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </motion.button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-gray-300 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </nav>
    </header>
  );
}