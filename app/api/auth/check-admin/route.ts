import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';

export async function GET() {
  try {
    const { isAdmin } = await requireAdmin();
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Admin check failed:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
