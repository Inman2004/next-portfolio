import { requireAdmin } from '@/lib/auth';

export default async function TestPage() {
  const { isAdmin } = await requireAdmin();
  
  if (!isAdmin) {
    return <div>Not authorized</div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <p>You have admin access!</p>
    </div>
  );
}
