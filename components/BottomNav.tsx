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
  Home
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
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
      href: "#experience", 
      label: "Experience", 
      icon: (props: IconProps) => <BriefcaseBusiness {...props} className="w-4 h-4 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors" /> 
    },
    { 
      href: "#services", 
      label: "Services", 
      icon: (props: IconProps) => <Handshake {...props} className="w-4 h-4 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors" /> 
    },
    { 
      href: "#contact", 
      label: "Contact", 
      icon: (props: IconProps) => <MailIcon {...props} className="w-4 h-4 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" /> 
    },
    { 
      href: "/blog", 
      label: "Blog", 
      icon: (props: IconProps) => <Flame {...props} className="w-4 h-4 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" /> 
    },
  ],
  contact: {
    email: "hello@example.com",
    social: [
      {
        href: "https://x.com/yourhandle",
        label: "X (Twitter)",
        icon: (props: IconProps) => <Icons.calendar {...props} className="w-4 h-4" />,
      },
      {
        href: "https://linkedin.com/in/yourhandle",
        label: "LinkedIn",
        icon: (props: IconProps) => <Icons.email {...props} className="w-4 h-4" />,
      },
      {
        href: "mailto:hello@example.com",
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
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: (props: IconProps) => <LayoutDashboard {...props} className="w-4 h-4 mr-2" />
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
        className: ''
      }
    ];

    // Add New Post button on blog pages for authenticated users
    if (isBlogPage && user) {
      items.push({
        href: '/blog/new',
        label: 'New Post',
        icon: (props: IconProps) => <PencilIcon {...props} className="w-5 h-5" />,
        className: 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300'
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
    <div className="fixed bottom-5 right-5 hidden md:flex flex-col items-center justify-center z-50">
      <TooltipProvider>
        <Dock direction="middle" className="bg-background/80 backdrop-blur-md border border-border/10 shadow-lg">
          {visibleNavItems.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {item.href ? (
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full text-foreground hover:bg-foreground/10",
                        (pathname === item.href || 
                        (pathname?.startsWith('/blog') && item.href === '#blog')) ? 'text-primary' : '',
                        item.className
                      )}
                    >
                      <item.icon className="size-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={item.onClick}
                      aria-label={item.label}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full hover:text-foreground/80"
                      )}
                    >
                      <item.icon className="size-4" />
                    </button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
          
          <Separator orientation="vertical" className="h-full py-2" />
          
          {user ? (
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-accent/50 transition-colors focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={showDropdown}
                    onBlur={() => setShowDropdown(false)}
                  >
                    <UserAvatar 
                      photoURL={user.photoURL || ''} 
                      displayName={user.displayName || 'User'} 
                      size={32}
                      className="w-8 h-8"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Account</p>
                </TooltipContent>
              </Tooltip>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full right-0 mb-2 w-48 rounded-md shadow-lg bg-background border border-border overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      {DashboardLinks.filter(link => !link.adminOnly || user?.email === 'rvimman@gmail.com').map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                        >
                          {link.icon({ className: 'w-4 h-4 mr-2' })}
                          {link.label}
                        </Link>
                      ))}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/signin"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12 rounded-full hover:text-foreground/80"
                    )}
                  >
                    <LogIn className="w-4 h-4 text-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign in</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12 rounded-full hover:text-foreground/80"
                    )}
                  >
                    <UserPlus className="w-4 h-4 text-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign up</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          <Separator orientation="vertical" className="h-full py-2" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DockIcon>
                  <ThemeSwitcher className="w-full p-6 h-full" />
                </DockIcon>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
        </Dock>
      </TooltipProvider>
    </div>
  );
}
