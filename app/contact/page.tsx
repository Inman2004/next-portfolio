'use client';

import { Metadata } from 'next';
import { motion as m } from 'framer-motion';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  FaGithub,
  FaLinkedin,
  FaXTwitter
} from 'react-icons/fa6';
import { SiGmail } from 'react-icons/si';
import emailjs from '@emailjs/browser';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Send me an email anytime',
    value: 'rvimman@gmail.com',
    href: 'mailto:rvimman@gmail.com',
    color: 'text-blue-500',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Call me for urgent matters',
    value: '+91 6382924427',
    href: 'tel:+916382924427',
    color: 'text-green-500',
  },
  {
    icon: MapPin,
    title: 'Location',
    description: 'Based in Chennai, India',
    value: 'Chennai, Tamil Nadu',
    href: 'https://maps.app.goo.gl/5DVwK9b859Kk9GCK6',
    color: 'text-purple-500',
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'I typically respond within',
    value: '24 hours',
    href: '#',
    color: 'text-orange-500',
  },
];

const socialLinks = [
  { 
    icon: FaGithub, 
    href: 'https://github.com/rvimman', 
    label: 'GitHub', 
    color: 'hover:text-zinc-900 dark:hover:text-zinc-100' 
  },
  { 
    icon: FaLinkedin, 
    href: 'https://linkedin.com/in/rv3d', 
    label: 'LinkedIn', 
    color: 'hover:text-blue-600' 
  },
  { 
    icon: FaXTwitter, 
    href: 'https://twitter.com/rvimman_', 
    label: 'Twitter', 
    color: 'hover:text-zinc-900 dark:hover:text-zinc-100' 
  },
  { 
    icon: SiGmail, 
    href: 'mailto:rvimman@gmail.com', 
    label: 'Email', 
    color: 'hover:text-red-500' 
  }
];

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: '' });

      // Validate form
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      const result = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      if (result.text === 'OK') {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! I will get back to you within 24 hours.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Error details:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have a project in mind or want to collaborate? I'd love to hear from you. 
              Let's create something amazing together.
            </p>
          </m.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <m.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="text-center border border-zinc-700/80 bg-gradient-to-br from-zinc-50 to-zinc-100 transition-all dark:from-zinc-900 dark:to-zinc-800 shadow-none">
                  <CardContent className="pt-6">
                    <method.icon className={`w-8 h-8 mx-auto mb-4 ${method.color}`} />
                    <h3 className="font-semibold mb-2">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                    {method.href !== '#' ? (
                      <a
                        href={method.href}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {method.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium">{method.value}</p>
                    )}
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <m.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send Me a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and I'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell me about your project or how I can help you..."
                        rows={6}
                        required
                      />
                    </div>

                    {/* Status Message */}
                    {submitStatus.type && (
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 p-3 rounded-lg ${
                          submitStatus.type === 'success' 
                            ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' 
                            : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {submitStatus.type === 'success' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                        <p className="text-sm">{submitStatus.message}</p>
                      </m.div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </m.div>

            {/* Contact Info */}
            <m.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Let's Talk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    I'm always excited to work on new projects and collaborate with talented 
                    people. Whether you have a project in mind, need consulting, or just want 
                    to chat about technology, feel free to reach out.
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">What I can help with:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Full-stack web application development</li>
                      <li>• Frontend design and development</li>
                      <li>• API development and integration</li>
                      <li>• Technical consulting and code reviews</li>
                      <li>• Performance optimization</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Connect With Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Follow me on social media for updates and tech insights
                  </p>
                  <div className="flex gap-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 rounded-xl bg-accent/50 hover:bg-accent transition-all duration-200 ${social.color}`}
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Available for new projects</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      I'm currently accepting new projects and collaborations. 
                      Response time is typically within 24 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to common questions about working with me
            </p>
          </m.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "What's your typical project timeline?",
                a: "Project timelines vary based on complexity. A simple website might take 2-3 weeks, while a complex web application could take 2-3 months. I'll provide a detailed timeline after understanding your requirements."
              },
              {
                q: "Do you work with international clients?",
                a: "Yes, I work with clients worldwide. I'm comfortable with remote collaboration and can adjust my schedule to accommodate different time zones for important meetings."
              },
              {
                q: "What technologies do you specialize in?",
                a: "I specialize in modern web technologies including React, Next.js, Node.js, TypeScript, and various databases. I'm always learning new technologies to provide the best solutions."
              },
              {
                q: "Do you provide ongoing support after project completion?",
                a: "Yes, I offer ongoing support and maintenance packages. I believe in building long-term relationships with my clients and ensuring their projects continue to perform well."
              }
            ].map((faq, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
