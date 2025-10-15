'use client';

import { motion as m } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

type TermsAndConditionsProps = {
  onClose?: () => void;
  isModal?: boolean;
};

export default function TermsAndConditions({ onClose, isModal = false }: TermsAndConditionsProps) {
  const content = (
    <article className="max-w-4xl mx-auto p-6 space-y-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl text-primary font-bold mb-4">Terms and Conditions</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using this website and its blog content, you accept and agree to be bound by the terms and conditions outlined below. 
          If you do not agree with any part of these terms, you must not use our website.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">2. Blog Content</h2>
        <p className="mb-4">
          All blog posts, articles, and other content provided on this website are for informational purposes only. 
          The content reflects the personal opinions of the authors and does not constitute professional advice.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property</h2>
        <p className="mb-4">
          All content on this website, including but not limited to text, graphics, logos, and images, is the property 
          of the website owner or its content creators and is protected by copyright and other intellectual property laws.
        </p>
        <p className="mb-4">
          You may not reproduce, distribute, modify, or republish any content from this website without prior written permission.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">4. User-Generated Content</h2>
        <p className="mb-4">
          By submitting comments or other content to our blog, you grant us a non-exclusive, royalty-free, perpetual, 
          and worldwide license to use, modify, and display your content in connection with the website.
        </p>
        <p className="mb-4">
          You are solely responsible for the content you submit and must ensure it does not violate any laws or infringe on any third-party rights.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
        <p className="mb-4">
          The website and its content are provided "as is" without any warranties of any kind. We do not guarantee the accuracy, 
          completeness, or usefulness of any information on the website.
        </p>
        <p className="mb-4">
          In no event shall we be liable for any damages arising out of or in connection with the use of this website.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms and conditions at any time. Your continued use of the website 
          following any changes constitutes your acceptance of the new terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
        <p className="mb-4">
          If you have any questions about these terms, please contact us at 
          <a href="mailto:contact@example.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            contact@example.com
          </a>.
        </p>
      </section>

      <footer className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          By using this website, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
        </p>
      </footer>
    </article>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 dark:bg-black/80 backdrop-blur-sm">
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-white/5"
            aria-label="Close terms"
          >
            <X className="w-5 h-5" />
          </button>
          {content}
        </m.div>
      </div>
    );
  }

  return content;
}
