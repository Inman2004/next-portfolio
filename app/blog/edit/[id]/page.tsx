import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getBlogPost } from '@/lib/blogUtils';
import EditPostClient from './EditPostClient';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = params;
  const session = await auth();

  if (!session?.user) {
    // Or redirect to sign-in
    return notFound();
  }

  const post = await getBlogPost(id);

  if (!post) {
    return notFound();
  }

  // Authorize on the server
  const isAuthor = post.authorId === session.user.id;
  const isAdmin = (session.user as any).role === 'admin';

  if (!isAuthor && !isAdmin) {
    // Or redirect to an unauthorized page
    return notFound();
  }
  
  // The 'post' object from getBlogPost is already serialized.
  // We can pass it directly to the client component.
  return <EditPostClient post={post} />;
}