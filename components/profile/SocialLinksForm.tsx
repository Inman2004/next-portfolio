'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUserProfile } from '@/lib/user';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Twitter, Github, Linkedin, Instagram, Youtube, Facebook, Globe } from 'lucide-react';

const socialLinksSchema = z.object({
  twitter: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
});

type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

export function SocialLinksForm({ initialData }: { initialData: SocialLinksFormData }) {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = async (data: SocialLinksFormData) => {
    console.log('Form submitted with data:', data);
    
    if (!user) {
      console.error('No user found');
      return;
    }
    
    setIsLoading(true);
    console.log('Loading state set to true');
    
    try {
      // Clean up empty strings and undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '' && value !== undefined)
      ) as SocialLinksFormData;
      
      console.log('Cleaned data:', cleanedData);

      console.log('Calling updateUserProfile...');
      const updateResult = await updateUserProfile(user.uid, { socials: cleanedData });
      console.log('updateUserProfile result:', updateResult);
      
      console.log('Calling refreshUser...');
      await refreshUser();
      console.log('User data refreshed');
      
      // Success toast with custom styling
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-zinc-900">Success!</p>
                <p className="mt-1 text-sm text-zinc-500">Your social links have been updated.</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="bg-white rounded-md inline-flex text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });
      
    } catch (error) {
      console.error('Error in onSubmit:', error);
      
      // Log additional error details if available
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      
      // Error toast with custom styling
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-red-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-red-500 ring-opacity-50`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="mt-1 text-sm text-red-700">Failed to update social links. Please try again.</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="bg-red-50 rounded-md inline-flex text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  const SocialInput = ({ 
    id, 
    label, 
    icon: Icon,
    placeholder = '',
    prefix = '',
    ...props 
  }: {
    id: keyof SocialLinksFormData;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    placeholder?: string;
    prefix?: string;
  } & React.InputHTMLAttributes<HTMLInputElement>) => {
    const prefixWidth = prefix.length * 0.5; // Approximate width in rem
    const paddingLeft = `calc(${prefixWidth}rem + 1rem)`; // Add some extra padding
    
    return (
      <div className="space-y-2 w-full">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <Label htmlFor={id} className="whitespace-nowrap">{label}</Label>
        </div>
        <div className="relative w-full">
          {prefix && (
            <div className="absolute inset-y-0 left-3 flex items-center text-zinc-500 text-sm">
              {prefix}
            </div>
          )}
          <Input
            id={id}
            placeholder={placeholder}
            className={`w-full ${prefix ? 'pl-24' : ''} pr-3`}
            style={prefix ? { paddingLeft: `calc(${prefix.length * 0.6}rem + 1rem)` } : {}}
            {...register(id)}
            {...props}
          />
        </div>
        {errors[id] && (
          <p className="text-sm text-red-500">{errors[id]?.message?.toString()}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Add your social media profiles to help others connect with you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SocialInput
              id="twitter"
              label="Twitter"
              icon={Twitter}
              placeholder="username"
              prefix="twitter.com/"
            />
            
            <SocialInput
              id="github"
              label="GitHub"
              icon={Github}
              placeholder="username"
              prefix="github.com/"
            />
            
            <SocialInput
              id="linkedin"
              label="LinkedIn"
              icon={Linkedin}
              placeholder="username"
              prefix="linkedin.com/in/"
            />
            
            <SocialInput
              id="instagram"
              label="Instagram"
              icon={Instagram}
              placeholder="username"
              prefix="instagram.com/"
            />
            
            <SocialInput
              id="youtube"
              label="YouTube"
              icon={Youtube}
              placeholder="channel"
              prefix="youtube.com/"
            />
            
            <SocialInput
              id="facebook"
              label="Facebook"
              icon={Facebook}
              placeholder="username"
              prefix="facebook.com/"
            />
            
            <div className="md:col-span-2">
              <SocialInput
                id="website"
                label="Website"
                icon={Globe}
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
