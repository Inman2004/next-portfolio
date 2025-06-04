import { notFound } from 'next/navigation';
import { UserProfile } from '@/components/admin/UserProfile';

// Mock function to fetch user by ID
async function getUserById(id: string) {
  // In a real app, you would fetch this from your API
  if (id === 'new') {
    return undefined; // New user
  }
  
  // Simulate not found
  if (id === 'not-found') {
    return undefined;
  }
  
  return {
    id,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'ADMIN' as const,
    bio: 'Full-stack developer with a passion for building amazing web applications.',
    image: 'https://github.com/shadcn.png',
    isActive: true,
    createdAt: '2023-01-15T00:00:00.000Z',
  };
}

async function handleSave(userData: any) {
  'use server';
  // In a real app, you would save the user data to your database
  console.log('Saving user:', userData);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
}

async function handleDelete(userId: string) {
  'use server';
  // In a real app, you would delete the user from your database
  console.log('Deleting user:', userId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const userId = params.id;
  const isNewUser = userId === 'new';
  
  const user = isNewUser ? undefined : await getUserById(userId);
  
  // If user doesn't exist and it's not a new user, show 404
  if (!user && !isNewUser) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isNewUser ? 'Create New User' : 'Edit User'}
        </h1>
      </div>
      
      <UserProfile 
        user={user} 
        onSave={handleSave}
        onDelete={isNewUser ? undefined : handleDelete}
        isNew={isNewUser} 
      />
    </div>
  );
}
