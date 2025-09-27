"use client";

import {
  m,
  AnimatePresence,
  LazyMotion,
  domAnimation,
  MotionConfig,
  useReducedMotion,
  useInView,
} from "framer-motion";

interface BlogPost {
  id?: string;
  title: string;
  createdAt: {
    toDate: () => Date;
  };
  slug?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  [key: string]: any; // For any additional properties that might come from the API
}

import Image from "next/image";
import { MorphingText } from "@/components/magicui/morphing-text";
import { AuroraText } from "@/components/magicui/aurora-text";
import { FaBlog, FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Github, Linkedin, Quote } from "lucide-react";
import { SkillBadge } from "./skillColors";
import Link from "next/link";
import ProfileCard from "./ProfileCard";
import { useTheme } from "next-themes";
import { Badge } from "./ui/badge";
import { BlurFade } from "./ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";

const InteractiveCard3D = dynamic(() => import("./ThreeJS/HeroID"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md h-72 md:h-96 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse" />
  ),
});

export default function Hero() {
  const { resolvedTheme } = useTheme();
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(sectionRef, {
    margin: "-20% 0px -20% 0px",
    amount: 0.2,
  });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cache key for the latest post
  const CACHE_KEY = "latestBlogPost";
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const fetchLatestPost = useCallback(async () => {
    try {
      // Check if we have a cached version that's still valid
      const cachedData = localStorage.getItem(CACHE_KEY);
      const now = new Date().getTime();

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (now - timestamp < CACHE_DURATION) {
          setLatestPost(data);
          setIsLoading(false);
          return;
        }
      }

      // If no valid cache, fetch fresh data via API
      const res = await fetch("/api/blog");
      const json = await res.json();
      const posts = Array.isArray(json?.posts) ? json.posts : [];

      if (posts.length > 0) {
        // Pick newest by createdAt
        posts.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const first = posts[0];
        // Normalize createdAt to match existing consumption
        const postData = {
          ...first,
          createdAt: first?.createdAt
            ? { toDate: () => new Date(first.createdAt as string) }
            : undefined,
        } as any;
        setLatestPost(postData);

        // Cache the result
        const cacheData = {
          data: postData,
          timestamp: now,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error("Error fetching latest blog post:", error);
      // If there's an error but we have cached data, use that
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        setLatestPost(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchLatestPost();
    }
  }, [isClient, fetchLatestPost]);
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <section
          id="home"
          ref={sectionRef as any}
          className="min-h-screen flex items-center justify-center relative w-full overflow-hidden pb-24 pt-24 md:pt-24 lg:pt-0 will-change-transform"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-100/60 via-transparent to-transparent dark:from-zinc-900/40" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-pattern" />
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-zinc-300/30 to-transparent dark:via-zinc-700/30" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <BlurFade delay={0.25} inView>
              <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 pt-8 lg:pt-12">
                {/* Left Content - Text */}
                <div className="w-full lg:max-w-[60%] xl:max-w-[60%]">
                  {/* Left Content */}
                  <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.3 : 0.6,
                    ease: "easeOut",
                  }}
                  className="flex-1 text-center lg:text-left"
                >
                  <m.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
                    }
                    transition={{
                      delay: 0.2,
                      duration: reduceMotion ? 0.25 : 0.5,
                      ease: "easeOut",
                    }}
                    className="inline-block"
                  >
                    <span className="px-4 py-2 rounded-full bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 mb-6 inline-block backdrop-blur-sm">
                      Welcome to my portfolio
                    </span>
                  </m.div>

                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 to-zinc-900 dark:from-zinc-200 dark:to-zinc-50">
                      Hi, I&apos;m <AuroraText>Immanuvel</AuroraText> <span className="text-base font-extralight font-pacifico sm:text-sm">& I'm</span>
                    </span>
                  </h1>

                  <div className="text-sm sm:text-base md:text-lg text-zinc-700 dark:text-zinc-300 mb-2 min-h-[120px] flex items-center justify-center lg:justify-start">
                    {inView && (
                      <MorphingText
                        texts={[
                          "Junior Full-Stack Developer",
                          "Front-end expert",
                          "AI/ML enthusiast",
                          "Tech Blogger",
                          "Open Source Contributor",
                        ]}
                        className="text-center lg:text-left !h-[160px] text-zinc-800/90 dark:text-zinc-200"
                      />
                    )}
                  </div>
                  <div className="my-2 space-y-6">
                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                      <div className="flex items-center gap-1 bg-zinc-50/80 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          <NumberTicker value={4} />+
                        </span>{" "}
                        Years of Experience
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-50/80 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          <NumberTicker value={10} />+
                        </span>{" "}
                        Projects Completed
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-50/80 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          <NumberTicker value={15} />+
                        </span>{" "}
                        Technologies Mastered
                      </div>
                    </div>

                    {/* Technical Stack with Hover Effects */}
                    <div>
                      <p className="text-sm text-blue-600/80 dark:text-blue-300/80 mb-2 ml-2 font-livvic">
                        My current technical stack focuses on:
                      </p>
                      <div className="flex flex-wrap gap-2 mb-1 ml-2 cursor-pointer">
                        {/* <SkillBadge skill="Next.js" proficiency="Advanced" />
                        <SkillBadge skill="React" proficiency="Advanced" />
                        <SkillBadge skill="JavaScript" proficiency="Advanced" />
                        <SkillBadge skill="Python" proficiency="Expert" />
                        <SkillBadge skill="MongoDB"proficiency="Intermediate" />
                        <SkillBadge skill="Tailwind CSS" proficiency="Advanced" />
                        <SkillBadge skill="AI/ML" proficiency="Intermediate" /> */}
                        <Badge className="bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">Next.js</Badge>
                        <Badge className="bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">React</Badge>
                        <Badge className="bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">JavaScript</Badge>
                        <Badge className="bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">Python</Badge>
                        <Badge className="bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">MongoDB</Badge>
                        <Badge className="bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">Tailwind CSS</Badge>
                        <Badge className="bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">AI/ML</Badge>
                      </div>
                    </div>

                    {/* Featured Project Teaser */}
                    {!isLoading && latestPost ? (
                      <Link href={`/blog/${latestPost.id}`}>
                        <m.div
                          whileHover={{ scale: 1.02 }}
                          className="group relative mt-6 p-4 rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-50 dark:from-zinc-800/50 dark:to-zinc-900/20 border border-zinc-200 dark:border-zinc-900/50 cursor-pointer transition-all duration-300 hover:shadow-lg"
                        >
                          <span className="absolute -top-2 -right-2 bg-zinc-100 dark:bg-zinc-900/50 text-orange-800 dark:text-zinc-200 border border-zinc-900 dark:border-zinc-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            New{" "}
                            <FaBlog className="inline text-lg text-orange-500 dark:text-orange-400" />
                          </span>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                            Latest Blog
                          </p>
                          <h3 className="font-medium text-zinc-900 dark:text-white mb-1 line-clamp-1">
                            {latestPost.title}
                          </h3>
                          <p className="text-xs text-orange-600 dark:text-orange-300 group-hover:text-orange-700 dark:group-hover:text-orange-200 transition-colors">
                            {isClient && latestPost?.createdAt?.toDate
                              ? new Date(
                                  latestPost.createdAt.toDate()
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Read now"}{" "}
                            →
                          </p>
                        </m.div>
                      </Link>
                    ) : (
                      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-50 dark:from-zinc-800/50 dark:to-zinc-900/20 border border-zinc-100 dark:border-zinc-900/50">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {isClient ? "Loading latest post..." : "Latest post"}
                        </p>
                      </div>
                    )}

                    {/* Personal Touch */}
                    {/* <p className="text-sm text-zinc-500 dark:text-zinc-400 italic mt-4 max-w-lg">
                "I transform complex problems into elegant, user-centered solutions through clean code and thoughtful design."
              </p> */}
                  </div>
                  <div className="flex flex-col my-4 sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
                    <m.a
                      href="#projects"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-base sm:text-lg font-medium transition-all duration-300 shadow-lg shadow-emerald-500/20 text-white text-center w-full sm:w-auto"
                    >
                      View My Work
                    </m.a>
                    <m.a
                      href="/personal"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 sm:px-8 py-3 sm:py-4 border border-zinc-300 dark:border-zinc-700 rounded-lg text-base sm:text-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 text-center text-zinc-800 dark:text-zinc-200 w-full sm:w-auto"
                    >
                      Get to know me
                    </m.a>

                    {/* Social Links */}
                    <div className="flex ml-6 items-center gap-1 sm:gap-2 justify-center lg:justify-start flex-wrap">
                      <m.a
                        href="https://github.com/Inman2004"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        className="text-foreground hover:bg-purple-500 dark:hover:bg-purple-500 hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
                      >
                        <Github className="w-6 h-6" />
                      </m.a>
                      <m.a
                        href="https://linkedin.com/in/rv3d"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        className="text-foreground hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
                      >
                        <Linkedin className="w-6 h-6" />
                      </m.a>
                      <m.a
                        href="https://twitter.com/rvimman_"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        className="text-foreground hover:bg-black dark:hover:bg-black hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
                      >
                        <FaXTwitter className="w-6 h-6" />
                      </m.a>
                      <m.a
                        href="mailto:rvimman@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        className="text-foreground hover:bg-red-500 dark:hover:bg-red-500 hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300"
                      >
                        <SiGmail className="w-6 h-6" />
                      </m.a>
                      <m.a
                        href="https://rvimman-two.vercel.app"
                        target="_blank"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="online resume"
                        className="text-foreground hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 hover:text-white dark:hover:text-white p-2 rounded transition-all duration-300 saturate-0 brightness-200 hover:saturate-100"
                      >
                        <img src="/images/favicon.png" className="w-6 h-6" />
                      </m.a>
                    </div>
                  </div>
                </m.div>
              </div>

              {/* Right Content - Image */}
              <ProfileCard
                name="Immanuvel B"
                title="Software Engineer"
                handle="rvimman"
                status="Online"
                contactText="Online Resume"
                avatarUrl="/images/person_sw.png"
                miniAvatarUrl="/images/favicon.png"
                grainUrl="/images/grain.webp"
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={true}
                onContactClick={() => window.open("https://rvimman-two.vercel.app", "_blank")}
              />
            </div>
          </BlurFade>
        </div>

          {/* Scroll Indicator */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: reduceMotion ? 0.3 : 0.5 }}
            className="absolute bottom-8 left-1/2 transform -tranzinc-x-1/2"
          >
            <m.div
              animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }
              className="w-6 h-10 border-2 border-zinc-400/40 dark:border-zinc-600/40 rounded-full flex justify-center"
            >
              <m.div
                animate={
                  reduceMotion ? undefined : { height: ["20%", "80%", "20%"] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }
                className="w-1 bg-zinc-500/50 dark:bg-zinc-400/50 rounded-full mt-2"
              />
            </m.div>
          </m.div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
