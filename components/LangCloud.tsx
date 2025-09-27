import { IconCloud } from "@/components/ui/icon-cloud"
import { motion as m } from "framer-motion"
const slugs = [
  "typescript",
  "javascript",
  "react",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "docker",
  "git",
  "python",
  "github",
  "gitlab",
  "visualstudiocode",
  "figma",
]

export function LangCloud() {
  const images = slugs.map(
    (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`
  )

  return (
    <div className="relative md:flex md:flex-row flex-col size-full items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center mb-16">
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-sky-600 dark:from-emerald-400 dark:to-sky-500 bg-clip-text text-transparent p-2 mb-4"
          >
           Skills 
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-600 dark:text-zinc-400 text-center max-w-2xl"
          >
           I can work with a wide range of Tools and programming languages.
          </m.p>
        </div>
      <IconCloud images={images} />
    </div>
  )
}
