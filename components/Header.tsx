"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Home, Settings, Menu, X } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const navigationLinks: NavLink[] = [
  { href: '#home', label: 'Home', icon: <Home className="w-4 h-4 mr-1.5" /> },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#services', label: 'Services' },
  { href: '/blog', label: 'Blog' },
  { href: '#contact', label: 'Contact' },
];

const dashboardLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <Settings className="w-4 h-4 mr-2" /> },
  { href: '/profile', label: 'Profile', icon: <User className="w-4 h-4 mr-2" /> },
];

interface NavItemProps extends React.HTMLAttributes<HTMLLIElement> {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavItem({ 
  href, 
  children, 
  className = '',
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
    <li className={cn("text-center md:text-left", className)} {...props}>
      <Link
        href={href}
        onClick={handleClick}
        className={cn(
          'px-4 py-2 rounded-lg transition-colors duration-200',
          'text-foreground/80 hover:text-foreground',
          'hover:bg-accent/50 dark:hover:bg-accent/30',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isActive ? 'text-primary font-medium' : '',
          'block w-full md:w-auto',
          'flex items-center'
        )}
        scroll={!isAnchor}
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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

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

  // Filter navigation links based on current page
  const filteredNavLinks = isHome 
    ? navigationLinks 
    : navigationLinks.filter(link => !link.href.startsWith('#'));

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300',
        'backdrop-blur-md border-b',
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
          className="flex items-center"
        >
          <Link 
            href="/" 
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            Immanuvel.<span className="text-foreground text-xl ml-0.5">dev</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex items-center gap-2"
        >
          <ul className="flex items-center space-x-1">
            {filteredNavLinks.map((link) => (
              <NavItem key={link.href} href={link.href}>
                {link.icon || null}
                {link.label}
              </NavItem>
            ))}
          </ul>

          {/* Theme Toggle */}
          <div className="ml-2">
            <ThemeSwitcher />
          </div>

          {/* User Menu */}
          {user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/30 hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-haspopup="true"
                aria-expanded={showDropdown}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-foreground" />
                )}
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-popover border border-border overflow-hidden z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="py-1" role="none">
                      {dashboardLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                          role="menuitem"
                          onClick={() => setShowDropdown(false)}
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-2 ml-2">
              <Link
                href="/signup"
                className="px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
              <Link
                href="/signin"
                className="px-4 py-2 rounded-md text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
            </div>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <ThemeSwitcher />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-2 p-2 rounded-md text-foreground hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-popover/95 backdrop-blur-sm border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {filteredNavLinks.map((link) => (
                <NavItem 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </NavItem>
              ))}
              
              {user ? (
                <>
                  <div className="border-t border-border my-2"></div>
                  {dashboardLinks.map((link) => (
                    <NavItem 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </NavItem>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/signin"
                    className="block w-full px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-2 rounded-md text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 transition-colors text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
