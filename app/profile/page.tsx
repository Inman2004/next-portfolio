import { Metadata } from 'next';
import ProfileSettings from '@/components/ProfileSettings';

export const metadata: Metadata = {
  title: 'Profile Settings',
  description: 'Update your profile information and preferences',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 transition-colors duration-200">
      <ProfileSettings />
    </div>
  );
}