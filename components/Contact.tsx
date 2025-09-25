'use client';

import { motion as m } from 'framer-motion';
import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { 
  FaGithub,
  FaLinkedin,
  FaXTwitter
} from 'react-icons/fa6';
import { SiGmail } from 'react-icons/si';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: '' });

      const result = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      if (result.text === 'OK') {
        setSubmitStatus({
          type: 'success',
          message: 'Message sent successfully! I will get back to you soon.'
        });
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Error details:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: FaGithub, href: 'https://github.com/Inman2004', label: 'GitHub', color: '#a930d5', darkColor: '#a930d5' },
    { icon: FaLinkedin, href: 'https://linkedin.com/in/rv3d', label: 'LinkedIn', color: '#0A66C2', darkColor: '#0A66C2' },
    { icon: FaXTwitter, href: 'https://twitter.com/rvimman_', label: 'Twitter', color: '#000', darkColor: '#fff' },
    { icon: SiGmail, href: 'mailto:rvimman@gmail.com', label: 'Email', color: '#cf594e', darkColor: '#cf594e' }
  ];

  return (
    <section id="contact" className="bg-white dark:bg-gradient-to-b dark:from-zinc-900 rounded-lg dark:to-zinc-950 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Have a question or want to work together? Feel free to reach out!
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <m.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-8"
          >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="from_name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  name="from_name"
                  id="from_name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-zinc-900 dark:border-zinc-600 bg-zinc-300 dark:bg-zinc-800/50 py-2 px-3 text-zinc-900 dark:text-white shadow-sm focus:border-blue-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="reply_to" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  name="reply_to"
                  id="reply_to"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-zinc-900 dark:border-zinc-600 bg-zinc-300 dark:bg-zinc-800/50 py-2 px-3 text-zinc-900 dark:text-white shadow-sm focus:border-blue-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-zinc-900 dark:border-zinc-600 bg-zinc-300 dark:bg-zinc-800/50 py-2 px-3 text-zinc-900 dark:text-white shadow-sm focus:border-blue-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-indigo-500 transition-colors"
                />
              </div>

              {submitStatus.type && (
                <div
                  className={`p-4 rounded-lg ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <m.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-tranzinc-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    Sending...
                    <m.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Send className="w-4 h-4" />
                    </m.div>
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </m.button>
            </form>
          </m.div>

          {/* Social Links & Info */}
          <m.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-gradient-to-b dark:from-zinc-800 dark:to-zinc-900 p-8 rounded-xl border border-zinc-900 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
                Connect With Me
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((link, index) => (
                  <m.a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors group border border-zinc-900 dark:border-zinc-700"
                  >
                    <link.icon 
                      style={{
                        '--icon-color': link.color,
                        '--icon-dark-color': link.darkColor || link.color,
                      } as React.CSSProperties}
                      className="w-5 h-5 group-hover:opacity-80 transition-opacity text-[color:var(--icon-color)] dark:text-[color:var(--icon-dark-color)]"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">{link.label}</span>
                  </m.a>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gradient-to-b dark:from-zinc-800 dark:to-zinc-900 p-8 rounded-xl border border-zinc-900 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
                Location
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Based in <b className='text-blue-600 dark:text-blue-400 font-medium'>Bangalore, Chennai, India</b><br />
                Available for <b className='text-blue-600 dark:text-blue-400 font-medium'>remote</b> work worldwide
              </p>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default Contact; 