"use client";

import { 
  CalendarIcon, 
  Home as HomeIcon, 
  MailIcon, 
  PencilIcon,
  User2,
  AppWindow,
  BriefcaseBusiness,
  Handshake,
  Flame,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  FileText,
  LogIn,
  UserPlus,
  ChevronLeft,
  Home,
  Pen,
  Rss,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { ThemeSwitcher } from "./ui/ThemeSwitcher";
import Image from "next/image";
import { FaBlog } from "react-icons/fa6";

export type IconProps = React.HTMLAttributes<SVGElement>;

const Icons = {
  calendar: (props: IconProps) => <CalendarIcon {...props} />,
  email: (props: IconProps) => <MailIcon {...props} />,
};

interface NavItem {
  href?: string;
  label: string;
  icon: (props: IconProps) => React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

const DATA: { navbar: NavItem[]; contact: { email: string; social: NavItem[] } } = {
  navbar: [
    { 
      href: "#home", 
      label: "Intro", 
      icon: (props: IconProps) => <User2 {...props} className="w-4 h-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" /> 
    },
    { 
      href: "#projects", 
      label: "Projects", 
      icon: (props: IconProps) => <AppWindow {...props} className="w-4 h-4 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors" /> 
    },
    { 
      href: "#skills", 
      label: "Skills", 
      icon: (props: IconProps) => <Wrench {...props} className="w-4 h-4 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors" /> 
    },
    { 
      href: "#experience", 
      label: "Experience", 
      icon: (props: IconProps) => <BriefcaseBusiness {...props} className="w-4 h-4 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors" /> 
    },
    { 
      href: "#contact", 
      label: "Contact", 
      icon: (props: IconProps) => <MailIcon {...props} className="w-4 h-4 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" /> 
    },
    { 
      href: "/blog", 
      label: "Blog", 
      icon: (props: IconProps) => (
        <FaBlog {...props} className="w-4 h-4 group-hover:text-orange-600 hover:fill-orange-600 dark:hover:text-orange-400 dark:hover:fill-orange-400 hover:scale-110 transition-colors" />
      )
    },
  ],
  contact: {
    email: "rvimman@gmail.com",
    social: [
      {
        href: "https://x.com/rvimman_",
        label: "X (Twitter)",
        icon: (props: IconProps) => <Icons.calendar {...props} className="w-4 h-4" />,
      },
      {
        href: "https://linkedin.com/in/rv3d",
        label: "LinkedIn",
        icon: (props: IconProps) => <Icons.email {...props} className="w-4 h-4" />,
      },
      {
        href: "mailto:rvimman@gmail.com",
        label: "Email",
        icon: (props: IconProps) => <MailIcon {...props} className="w-4 h-4" />,
      },
    ],
  },
};

const DashboardLinks = [
  { 
    href: '/profile', 
    label: 'Profile', 
    icon: (props: IconProps) => <User {...props} className="w-4 h-4 mr-2" />
  },
  { 
    href: '/blog', 
    label: 'Blog', 
    icon: (props: IconProps) => <FaBlog {...props} className="w-4 h-4 mr-2" />
  },
  { 
    href: '/admin', 
    label: 'Admin', 
    icon: (props: IconProps) => <Settings {...props} className="w-4 h-4 mr-2" />,
    adminOnly: true
  },
  { 
    href: '/blog/new', 
    label: 'New Post', 
    icon: (props: IconProps) => <FileText {...props} className="w-4 h-4 mr-2" />
  }
];

export function BottomNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Toggle dock expansion
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Handle navigation item clicks
  const handleItemClick = useCallback((item: NavItem, e: React.MouseEvent) => {
    if (item.onClick) {
      item.onClick(e);
    } else if (item.href) {
      if (item.href.startsWith('http')) {
        window.open(item.href, '_blank');
      } else if (item.href.startsWith('#')) {
        e.preventDefault();
        const targetId = item.href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push(item.href);
      }
    }
    // Always collapse after navigation
    setIsExpanded(false);
  }, [router]);

  // Handle click outside to close expanded dock
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isExpanded) return;
      const target = event.target as Node | null;
      const container = containerRef.current;
      if (container && target && !container.contains(target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Update active section based on scroll
  useEffect(() => {
    if (pathname === '/') {
      const handleScroll = () => {
        const sections = ['home', 'projects', 'experience', 'services', 'contact'];
        const scrollPosition = window.scrollY + 200;

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const offsetTop = element.offsetTop;
            const offsetHeight = element.offsetHeight;

            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section);
              break;
            }
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check

      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [pathname]);
  
  // Navigation items for non-home pages (minimal navigation)
  const minimalNavItems = useMemo(() => {
    const isBlogPage = pathname?.startsWith('/blog');
    
    // Define minimal nav items with proper typing
    const items: NavItem[] = [
      {
        href: '', // Empty href for back button (will use router.back())
        label: 'Back',
        icon: (props: IconProps) => <ChevronLeft {...props} className="w-5 h-5" />,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          router.back();
        },
        className: ''
      },
      {
        href: '/',
        label: 'Home',
        icon: (props: IconProps) => <HomeIcon {...props} className="w-5 h-5" />,
        className: 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors'
      },
      {
        href: '/blog',
        label: 'Blog',
        icon: (props: IconProps) => <FaBlog {...props} className="w-5 h-5" />,
        className: 'text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors'
      }
    ];

    // Add New Post button on blog pages for authenticated users
    if (isBlogPage && user) {
      items.push({
        href: '/blog/new',
        label: 'New Post',
        icon: (props: IconProps) => <PencilIcon {...props} className="w-5 h-5" />,
        className: 'text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors'
      });
    }

    return items;
  }, [router, pathname, user]);

  // Determine which navigation items to show based on current route
  const visibleNavItems = useMemo(() => {
    if (!pathname) return [];
    
    const currentPath = pathname.split('?')[0]; // Remove query params
    const isHomePage = currentPath === '/';
    
    // On home page, show all navigation items
    if (isHomePage) {
      return DATA.navbar;
    }
    
    // On other pages, show minimal navigation (Back and Home)
    return minimalNavItems;
  }, [pathname, minimalNavItems]);
  
  // Close dropdown when route changes
  useEffect(() => {
    setShowDropdown(false);
    setIsExpanded(false);
  }, [pathname]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`dock-container fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out hidden md:block ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div 
        className={`h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-r-2xl shadow-xl border-r border-gray-200 dark:border-gray-800 flex flex-col p-2 transition-all ${isHovering ? 'shadow-2xl' : ''}`}
        initial={false}
        animate={{ width: isExpanded ? '16rem' : '4rem' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
      {/* Expand/Collapse Button */}
      <button
        onClick={toggleExpand}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 mb-4 self-end"
        aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
        type="button"
      >
        <ChevronLeft 
          className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
        />
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
        {visibleNavItems.map((item, index) => {
          const isActive = item.href?.startsWith('#') 
            ? activeSection === item.href.substring(1) 
            : pathname === item.href;

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={(e) => handleItemClick(item, e)}
                  className={cn(
                    'flex items-center p-3 rounded-xl transition-all duration-200 w-full',
                    'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isActive && 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    item.className
                  )}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={item.label}
                >
                  <div className="flex items-center">
                    {item.icon({ className: 'w-5 h-5 flex-shrink-0' })}
                    <motion.span 
                      className="ml-3 whitespace-nowrap"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: isExpanded ? 1 : 0,
                        x: isExpanded ? 0 : -10,
                        display: isExpanded ? 'inline-block' : 'none'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </div>
                </motion.button>
              </TooltipTrigger>
              {!isExpanded && (
                <TooltipContent side="right" className="bg-gray-900 text-white text-xs ml-2">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom Section - Theme Toggle and User Menu */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <div className="flex flex-col justify-between items-center gap-4 p-4">
          <ThemeSwitcher />
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-haspopup="true"
              >                {isExpanded && (
                <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-md p-2">
                <UserAvatar
                  photoURL={user.photoURL?.startsWith('user://') ? `user_${user.uid}` : user.photoURL || undefined}
                  displayName={user.displayName || 'User'}
                  compact
                  className={`h-8 w-8 cursor-pointer transition-all duration-200 ease-in-out`}
                  title={user.displayName || 'User'}
                  disableLink={true}
                />

                <div className="flex flex-col text-left">
                <p className="text-xs text-muted-foreground truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
              </div>
              )}
              {!isExpanded && (
              <UserAvatar
                  photoURL={user.photoURL?.startsWith('user://') ? `user_${user.uid}` : user.photoURL || undefined}
                  displayName={user.displayName || 'User'}
                  compact
                  className={`h-8 w-8 cursor-pointer ${isExpanded ? 'hidden' : 'block'} transition-all duration-200 ease-in-out`}
                  title={user.displayName || 'User'}
                  disableLink={true}
                />
              )}
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15, ease: 'easeInOut' }}
                    className="absolute right-0 left-0 bottom-full mb-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                    <div className="py-1">
                      {DashboardLinks.map((link, index) => (
                        <motion.div
                          key={index}
                          initial={false}
                          animate={{ opacity: 1 }}
                          className="transition-colors duration-150 ease-in-out"
                        >
                          <Link
                            href={link.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {link.icon({ className: 'w-4 h-4 mr-2' })}
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        {!user && (
          <div className="flex flex-col space-y-2 p-4">
            <Link
              href="/signin"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'w-full flex items-center justify-center'
              )}
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span className={isExpanded ? 'block' : 'hidden'}>Login</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'w-full flex items-center justify-center'
              )}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className={isExpanded ? 'block' : 'hidden'}>Sign up</span>
            </Link>
          </div>
        )}
      </div>
      </motion.div>
    </div>
  );
}
