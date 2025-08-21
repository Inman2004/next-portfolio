import { NextRequest, NextResponse } from 'next/server';
import { refreshVectorDatabase, getDataFreshnessInfo } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    // Check if it's a manual refresh request
    const body = await req.json();
    const { action } = body;

    if (action === 'refresh') {
      // Force refresh the vector database
      refreshVectorDatabase();
      
      // Get fresh data info
      const freshnessInfo = getDataFreshnessInfo();
      
      return NextResponse.json({
        success: true,
        message: 'Vector database refreshed successfully',
        timestamp: new Date().toISOString(),
        dataFreshness: freshnessInfo
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "refresh" to refresh data.'
    }, { status: 400 });

  } catch (error) {
    console.error('Error refreshing data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to refresh data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return current data freshness info
    const freshnessInfo = getDataFreshnessInfo();
    
    return NextResponse.json({
      success: true,
      dataFreshness: freshnessInfo,
      message: 'Data freshness information retrieved'
    });
  } catch (error) {
    console.error('Error getting data freshness:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get data freshness info',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
