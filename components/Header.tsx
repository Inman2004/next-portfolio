"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User2, Home, AppWindow, BriefcaseBusiness, Mail, LogOut, User, Settings, Flame, Wrench, Plus, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ThemeSwitcher } from './ui/ThemeSwitcher';
import { FaBlog } from 'react-icons/fa6';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

// Main navigation links with better responsive support
const getNavigationLinks = (isHome: boolean): NavLink[] => {
  const homeLinks: NavLink[] = [
    { href: '#home', label: 'Intro', icon: <User2 className="w-4 h-4 group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-300" /> },
    { href: '#projects', label: 'Projects', icon: <AppWindow className="w-4 h-4 group-hover:scale-110 group-hover:text-green-500 dark:group-hover:text-green-400 transition-all duration-300" /> },
    { href: '#experience', label: 'Experience', icon: <BriefcaseBusiness className="w-4 h-4 group-hover:scale-110 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-all duration-300" /> },
    { href: '#skills', label: 'Skills', icon: <Wrench className="w-4 h-4 group-hover:scale-110 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-all duration-300" /> },
    { href: '#contact', label: 'Contact', icon: <Mail className="w-4 h-4 group-hover:scale-110 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-all duration-300" /> },
  ];

  const globalLinks: NavLink[] = [
    { href: '/', label: 'Home', icon: <Home className="w-4 h-4 group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-300" /> },
    { href: '/about', label: 'About', icon: <User2 className="w-4 h-4 group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-300" /> },
    { href: '/projects', label: 'Projects', icon: <AppWindow className="w-4 h-4 group-hover:scale-110 group-hover:text-green-500 dark:group-hover:text-green-400 transition-all duration-300" /> },
    { href: '/contact', label: 'Contact', icon: <Mail className="w-4 h-4 group-hover:scale-110 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-all duration-300" /> },
    {
      href: '/blog',
      label: 'Blog',
      icon: <FaBlog className="w-4 h-4 group-hover:scale-110 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-all duration-300" />,
      className: 'group/blog',
    },
    {
      href: "/contact",
      label: "Connect",
      icon: <Handshake className="w-4 h-4 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors" /> 
    }
  ];

  return isHome ? homeLinks.concat([globalLinks[globalLinks.length - 1]]) : globalLinks;
};

interface DashboardLink extends NavLink {
  adminOnly?: boolean;
}

const dashboardLinks: DashboardLink[] = [
  { 
    href: '/blog/new', 
    label: 'New Post', 
    icon: <Plus className="w-4 h-4 mr-2" /> 
  },
  { 
    href: '/profile', 
    label: 'Profile', 
    icon: <User className="w-4 h-4 mr-2" /> 
  },
  { 
    href: '/admin', 
    label: 'Admin', 
    icon: <Settings className="w-4 h-4 mr-2" />,
    adminOnly: true 
  },
];

interface NavItemProps extends React.HTMLAttributes<HTMLLIElement> {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
}

function NavItem({
  href,
  children,
  className = '',
  color = '',
  onClick,
  ...props
}: NavItemProps) {
  const isAnchor = href.startsWith('#');
  const pathname = usePathname();
  const isActive = pathname === href || (isAnchor && pathname === '/' + href.substring(1));

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

    if (onClick) {
      onClick();
    }
  };

  return (
    <li
      className={cn(
        "group relative",
        className,
        color
      )}
      {...props}
    >
      <Link
        href={href}
        onClick={handleClick}
        className={cn(
          'px-3 py-2.5 rounded-lg',
          'font-medium',
          'text-xl',
          'text-foreground/80 group-hover:text-foreground',
          'hover:bg-accent/20 dark:hover:bg-accent/30',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isActive ? 'text-primary' : '',
          'block w-full md:w-auto',
          'flex items-center',
          'transition-all duration-300 ease-out',
          'relative overflow-hidden',
          'group-hover:pr-12', // Increased padding for smoother transition
          'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5',
          'after:bg-current after:opacity-0 after:transition-all after:duration-300',
          'group-hover:after:opacity-30',
          'after:transform after:scale-x-0 after:group-hover:scale-x-100 after:origin-center'
        )}
        scroll={!isAnchor}
      >
        {/* Icon */}
        <span className="flex items-center justify-center w-5 transition-transform duration-300 group-hover:scale-110">
          {React.Children.map(children, child =>
            React.isValidElement(child) && child.type !== 'span' ? child : null
          )}
        </span>

        {/* Label with hover effect */}
        <span className="relative group/label">
          <span className={cn(
            'ml-3 whitespace-nowrap',
            'transition-all duration-300 ease-out',
            'opacity-0 md:group-hover:opacity-100',
            'w-0 md:group-hover:w-auto',
            'overflow-hidden',
            'transform transition-transform duration-300 ease-out',
            'md:group-hover:translate-x-0 -translate-x-1',
            isActive ? 'font-medium' : 'font-normal',
            'text-xl',
            'md:group-hover:mr-10',
            'relative inline-block',
            'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5',
            'after:bg-current after:opacity-0 after:transition-all after:duration-300',
            'group-hover/label:after:w-full group-hover/label:after:opacity-70',
            isActive ? 'after:opacity-100 after:w-full' : ''
          )}>
            {React.Children.map(children, child =>
              typeof child === 'string' ? child : null
            )}
          </span>
        </span>

        {/* Hover Indicator */}
        <span className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2',
          'opacity-0 md:group-hover:opacity-100',
          'transition-all duration-300 ease-out',
          'transform transition-transform duration-300 ease-out',
          'md:group-hover:translate-x-0 translate-x-2',
          'text-sm text-muted-foreground',
          'hidden md:inline-block',
          'whitespace-nowrap',
          'px-1.5 py-0.5 rounded',
          isActive ? 'text-primary' : ''
        )}>
          {navigationLinks.find(l => l.href === href)?.label}
        </span>
      </Link>
    </li>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === '/';
  
  // Handle mobile menu link clicks
  const handleMobileLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    // Add a small delay to allow the menu to close before navigation
    setTimeout(() => {
      if (href.startsWith('#')) {
        if (isHome) {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          router.push(`/${href}`);
        }
      } else {
        router.push(href);
      }
    }, 100);
  };
  
  // Handle navigation link clicks
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (isHome) {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push(`/${href}`);
      }
    }
  };
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const menuButton = document.querySelector('button[aria-label="Toggle menu"]');
      const menu = document.querySelector('.mobile-menu-dropdown');
      
      if (menuOpen && menuButton && !menuButton.contains(target) && menu && !menu.contains(target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      setMenuOpen(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Get navigation links based on current page
  const navigationLinks = getNavigationLinks(isHome);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300',
        'backdrop-blur-md border-b shadow-sm',
        'lg:hidden', // Hide on desktop devices
        scrolled
          ? 'bg-background/95 border-border/10 shadow-sm'
          : 'bg-background/80 border-transparent',
      )}
    >
      <nav className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          {!isHome && (
            <>
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent/50 transition-colors"
                aria-label="Go back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground/80"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="h-6 w-px bg-border/50" />
            </>
          )}
          <Link
            href="/"
            className={cn(
              "text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent flex items-center",
              "transition-opacity hover:opacity-80",
              !isHome && "text-xl md:text-2xl"
            )}
            onClick={() => setMenuOpen(false)}
          >
            {isHome ? (
              <>
                Immanuvel.<span className="text-foreground text-xl ml-0.5">dev</span>
              </>
            ) : (
              <>
                <Home className="w-5 h-5 text-foreground mr-1.5" />
              </>
            )}
          </Link>
        </motion.div>



        {/* Mobile & Tablet Menu Button */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <div className="relative">
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300",
                "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "active:scale-95",
                menuOpen ? "bg-accent/30" : "bg-transparent"
              )}
              aria-expanded={menuOpen ? "true" : "false"}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-3 w-64 rounded-2xl shadow-xl bg-background/95 backdrop-blur-xl border border-border overflow-hidden z-50"
                >
                  <div className="py-3">
                    {navigationLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200",
                            "text-foreground/80 hover:text-foreground hover:bg-accent/50",
                            "active:scale-95 active:bg-accent/70",
                            (pathname === link.href || 
                             (link.href.startsWith('#') && isHome && window.location.hash === link.href)) && 
                            "text-primary bg-accent/30"
                          )}
                          onClick={(e) => handleMobileLinkClick(e, link.href)}
                        >
                          {React.cloneElement(link.icon as React.ReactElement, {
                            className: 'w-5 h-5 mr-3 flex-shrink-0'
                          })}
                          <span className="flex-1">{link.label}</span>
                          {(pathname === link.href || 
                            (link.href.startsWith('#') && isHome && window.location.hash === link.href)) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-primary"
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                    
                    {user ? (
                      <>
                        <div className="border-t border-border/30 my-2 mx-2"></div>
                        {dashboardLinks
                          .filter(link => !link.adminOnly || (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL))
                          .map((link, index) => (
                          <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (navigationLinks.length + index) * 0.05 }}
                          >
                            <Link
                              href={link.href}
                              className="flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-200 active:scale-95"
                              onClick={(e) => handleMobileLinkClick(e, link.href)}
                            >
                              {link.icon}
                              <span className="flex-1">{link.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (navigationLinks.length + dashboardLinks.length) * 0.05 }}
                        >
                          <button
                            onClick={() => {
                              handleLogout();
                              setMenuOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-3 mx-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 active:scale-95"
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span className="flex-1 text-left">Sign out</span>
                          </button>
                        </motion.div>
                      </>
                    ) : (
                      <div className="px-2 pb-2 pt-2 border-t border-border/30 mt-2">
                        <div className="space-y-2">
                          <Link
                            href="/signin"
                            className="block w-full text-center px-4 py-3 text-sm font-medium rounded-xl text-foreground bg-accent/30 hover:bg-accent/50 transition-all duration-200 active:scale-95"
                            onClick={(e) => handleMobileLinkClick(e, '/signin')}
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/signup"
                            className="block w-full text-center px-4 py-3 text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/90 transition-all duration-200 active:scale-95"
                            onClick={(e) => handleMobileLinkClick(e, '/signup')}
                          >
                            Create account
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Click outside handler for mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
