import { SocialLinks as SocialLinksType } from '@/types';
import { SiPinterest } from 'react-icons/si';

interface SocialLinksProps {
  socials: SocialLinksType;
  authorName?: string;
  className?: string;
}

export function SocialLinks({ socials, authorName, className = 'flex justify-center items-center' }: SocialLinksProps) {
  // Ensure socials is an object and has at least one valid URL
  const hasValidSocials = socials && 
                         typeof socials === 'object' && 
                         Object.values(socials).some(val => Boolean(val));
  
  if (!hasValidSocials) return null;

  return (
    <div className={`${className}`}>
      {authorName && (
        <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Follow <b className="text-zinc-900 dark:text-white">{authorName}</b>
        </h4>
      )}
      <div className="flex flex-wrap gap-3">
        {socials.twitter && (
          <SocialLink
            href={`https://twitter.com/${socials.twitter}`}
            label="Twitter"
            icon={
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            }
            hoverClass="hover:text-blue-500 dark:hover:text-blue-400"
          />
        )}
        {socials.github && (
          <SocialLink
            href={`https://github.com/${socials.github}`}
            label="GitHub"
            icon={
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            }
            hoverClass="hover:text-zinc-900 dark:hover:text-white"
          />
        )}
        {socials.linkedin && (
          <SocialLink
            href={`https://linkedin.com/in/${socials.linkedin}`}
            label="LinkedIn"
            icon={
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            }
            hoverClass="hover:text-blue-700 dark:hover:text-blue-500"
          />
        )}
        {socials.instagram && (
          <SocialLink
            href={`https://instagram.com/${socials.instagram}`}
            label="Instagram"
            icon={
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            }
            hoverClass="hover:text-pink-600 dark:hover:text-pink-400"
          />
        )}
        {socials.youtube && (
          <SocialLink
            href={`https://youtube.com/${socials.youtube}`}
            label="YouTube"
            icon={
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            }
            hoverClass="hover:text-red-600 dark:hover:text-red-500"
          />
        )}
        {socials.facebook && (
          <SocialLink
            href={`https://facebook.com/${socials.facebook}`}
            label="Facebook"
            icon={
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            }
            hoverClass="hover:text-blue-700 dark:hover:text-blue-500"
          />
        )}
        {socials.website && (
          <SocialLink
            href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`}
            label="Website"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            }
            hoverClass="hover:text-purple-600 dark:hover:text-purple-400"
            isStroke
          />
        )}
        {socials.pinterest && (
          <SocialLink
            href={`https://pinterest.com/${socials.pinterest}`}
            label="Pinterest"
            icon={
              <SiPinterest />
            }
            hoverClass="hover:text-red-600 dark:hover:text-red-400"
            isStroke
          />
        )}
      </div>
    </div>
  );
}

interface SocialLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  hoverClass: string;
  isStroke?: boolean;
}

function SocialLink({ href, label, icon, hoverClass, isStroke = false }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-zinc-600 dark:text-zinc-400 transition-colors ${hoverClass}`}
      aria-label={label}
    >
      <svg
        className="w-5 h-5"
        fill={isStroke ? 'none' : 'currentColor'}
        stroke={isStroke ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {icon}
      </svg>
    </a>
  );
}
