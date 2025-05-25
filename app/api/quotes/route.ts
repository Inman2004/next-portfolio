import { NextResponse } from 'next/server';

// Google Sheets CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRw7PXrVPbKgZvXmjS5q9hUGgHkWYKyZdmw-ZUzJXPETqassRI1SoDm-fopEh4o0PFQcBFMrYca9y7/pub?gid=0&single=true&output=csv';

// Cache configuration
const CACHE_TTL = 60 * 5; // 5 minutes
let cachedQuotes: any[] | null = null;
let lastFetchTime = 0;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedQuotes && (now - lastFetchTime) < CACHE_TTL * 1000) {
      return NextResponse.json(cachedQuotes);
    }

    // Fetch from Google Sheets
    const response = await fetch(SHEET_URL, {
      next: { revalidate: CACHE_TTL }, // Revalidate after cache TTL
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch quotes: ${response.statusText}`);
    }

    const csvData = await response.text();
    const quotes = csvToJson(csvData);
    
    // Update cache
    cachedQuotes = quotes;
    lastFetchTime = now;
    
    return NextResponse.json(quotes);
    
  } catch (error) {
    console.error('Error in quotes API:', error);
    
    // Fallback to local quotes if available
    try {
      const localQuotes = await import('@/data/quotes.json');
      return NextResponse.json(localQuotes.default);
    } catch (e) {
      console.error('Failed to load fallback quotes:', e);
      return NextResponse.json(
        { error: 'Failed to fetch quotes', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }
}

// Helper function to parse CSV with quoted values
function csvToJson(csv: string) {
  const lines = csv.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return []; // Need at least header and one data row
  
  // Handle potential BOM (Byte Order Mark) and get headers
  const headers = lines[0].replace(/^\uFEFF/, '')
    .match(/\s*"(.*?)"\s*|\s*([^,\s][^,]*[^,\s]*)\s*(?=,|$)/g)
    ?.map(h => h.trim().replace(/^"|"$/g, '').toLowerCase()) || [];

  if (headers.length < 2) return []; // Need at least quote and author columns

  return lines.slice(1)
    .map(line => {
      // Handle quoted values with commas
      const values = line.match(/\s*"(.*?)"\s*|\s*([^,\s][^,]*[^,\s]*)\s*(?=,|$)/g)
        ?.map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (!values || values.length < 2) return null;
      
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim() || '';
        return obj;
      }, {} as Record<string, string>);
    })
    .filter((quote): quote is { quote: string, author: string } => 
      quote !== null && 
      typeof quote.quote === 'string' && 
      typeof quote.author === 'string' &&
      quote.quote.trim() !== '' && 
      quote.author.trim() !== ''
    );
}
