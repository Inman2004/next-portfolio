import { NextRequest } from 'next/server';
import { GET as getPosts } from './handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  console.log('API Route - Received params:', params);
  
  // Ensure params is resolved before passing to the handler
  const resolvedParams = await Promise.resolve(params);
  console.log('API Route - Resolved params:', resolvedParams);
  
  return getPosts(request, { params: resolvedParams });
}

export const dynamic = 'force-dynamic';

