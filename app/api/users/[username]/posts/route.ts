import { NextRequest } from 'next/server';
import { GET as getPosts } from './handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  // Ensure params is resolved before passing to the handler
  const resolvedParams = await Promise.resolve(params);
  return getPosts(request, { params: resolvedParams });
}

export const dynamic = 'force-dynamic';

