import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileParam = searchParams.get('file');
    
    if (!fileParam) {
      return NextResponse.json(
        { error: 'File parameter is required' },
        { status: 400 }
      );
    }

    // Sanitize the filename to prevent directory traversal
    const filename = path.basename(fileParam);
    const filePath = path.join(process.cwd(), 'public', 'downloads', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return new Response(fileBuffer, {
      headers,
      status: 200,
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
