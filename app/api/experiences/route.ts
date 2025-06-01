import { NextResponse } from 'next/server';

// Google Sheets URL from environment variable
const SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || '';

// Cache configuration
const CACHE_TTL = 60 * 5; // 5 minutes
let cachedExperiences: any[] | null = null;
let lastFetchTime = 0;

export const dynamic = 'force-dynamic';

// Helper function to parse CSV with proper handling of quoted fields
function parseCSV(csvText: string) {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < currentLine.length; j++) {
      const char = currentLine[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Create an object with the values
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Clean up any remaining quotes
      value = value.replace(/^"|"$/g, '');
      
      // Handle different data types
      if (header === 'id') {
        obj[header] = Number(value) || 0;
      } else if (header === 'skills' || header === 'description') {
        obj[header] = value ? value.split(';').map((item: string) => 
          item.trim().replace(/^"|"$/g, '')
        ).filter(Boolean) : [];
      } else {
        obj[header] = value;
      }
    });
    
    // Only add non-empty rows
    if (obj.id !== 0 || Object.values(obj).some(v => v !== '' && v !== 0)) {
      result.push(obj);
    }
  }
  
  return result;
}

export async function GET() {
  if (!SHEET_URL) {
    console.error('Google Sheet URL is not configured');
    const localExperiences = await import('@/data/experiences');
    return NextResponse.json(localExperiences.experiences);
  }

  try {
    // Check cache first
    const now = Date.now();
    if (cachedExperiences && (now - lastFetchTime) < CACHE_TTL * 1000) {
      return NextResponse.json(cachedExperiences);
    }

    // Fetch from Google Sheets
    const response = await fetch(SHEET_URL, {
      next: { revalidate: CACHE_TTL },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch experiences: ${response.statusText}`);
    }

    const csvData = await response.text();
    const experiences = parseCSV(csvData);
    
    // Filter out any empty or invalid entries
    const validExperiences = experiences.filter(exp => 
      exp.id && exp.role && exp.company
    );
    
    // Update cache
    cachedExperiences = validExperiences;
    lastFetchTime = now;
    
    return NextResponse.json(validExperiences);
    
  } catch (error) {
    console.error('Error in experiences API:', error);
    
    // Fallback to local experiences if available
    try {
      const localExperiences = await import('@/data/experiences');
      return NextResponse.json(localExperiences.experiences);
    } catch (e) {
      console.error('Failed to load fallback experiences:', e);
      return NextResponse.json(
        { error: 'Failed to fetch experiences', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }
}
