import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Allowed file extensions for download (for security)
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
const PUBLIC_DOCS_DIR = 'docs'; // Directory inside public folder where files are stored

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    // Validate filename
    if (!filename) {
      return NextResponse.json(
        { error: 'Missing file parameter' },
        { status: 400 }
      );
    }

    // Prevent directory traversal and validate file extension
    const safeFileName = path.basename(filename);
    const ext = path.extname(safeFileName).toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'public', PUBLIC_DOCS_DIR, safeFileName);
    
    // Check if file exists and is accessible
    try {
      await fs.access(filePath);
    } catch (err) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read file as buffer
    const fileBuffer = await fs.readFile(filePath);
    
    // Get MIME type based on file extension
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Create response with file
    const response = new NextResponse(fileBuffer);
    
    // Set headers for file download
    response.headers.set('Content-Disposition', `attachment; filename="${safeFileName}"`);
    response.headers.set('Content-Type', mimeType);
    response.headers.set('Content-Length', fileBuffer.length.toString());
    
    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
