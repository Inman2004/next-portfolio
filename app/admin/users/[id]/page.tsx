import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { UserProfile } from '@/components/admin/UserProfile';
import { getUserProfile, updateUserProfile } from '@/lib/user';

type UserRole = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'USER';

function mapToUserProfileProps(uid: string, data: any | null) {
  if (!data) return undefined;
  return {
    id: uid,
    name: data.displayName || data.username || 'Unnamed',
    email: data.email || '',
    role: (data.role as UserRole) || 'USER',
    bio: data.bio || '',
    image: data.photoURL || '',
    isActive: data.isActive ?? true,
    createdAt: typeof data.createdAt?.toDate === 'function'
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt || new Date().toISOString()),
  } as const;
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const userId = params.id;
  const isNewUser = userId === 'new';

  const appUser = isNewUser ? null : await getUserProfile(userId);
  const user = isNewUser ? undefined : mapToUserProfileProps(userId, appUser);

  if (!user && !isNewUser) {
    notFound();
  }

  async function handleSave(userData: any) {
    'use server';
    const uid = userId;
    const payload: any = {
      displayName: userData.name,
      email: userData.email,
      photoURL: userData.image,
      bio: userData.bio,
      // Persist role if you add it to Firestore schema later
      role: userData.role,
    };
    await updateUserProfile(uid, payload);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${uid}`);
    return { success: true };
  }

  async function handleDelete(_userId: string) {
    'use server';
    // Deleting users typically requires Firebase Admin SDK; keep disabled for now
    return { success: false };
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
