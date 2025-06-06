import { NextRequest } from 'next/server';
import { GET as getPosts } from './handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  return getPosts(request, { params });
}

export const dynamic = 'force-dynamic';

