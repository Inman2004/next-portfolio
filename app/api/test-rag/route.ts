import { NextRequest } from "next/server";
import { searchDocuments, getRelevantContext } from "@/lib/rag";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || 'React skills';
  
  try {
    // Test search
    const searchResults = searchDocuments(query, 3);
    
    // Test context retrieval
    const context = getRelevantContext(query, 3);
    
    return new Response(JSON.stringify({
      query,
      searchResults: searchResults.map(r => ({
        id: r.document.id,
        title: r.document.metadata.title,
        type: r.document.metadata.type,
        score: r.score,
        content: r.document.content.substring(0, 100) + '...'
      })),
      context: context.substring(0, 200) + '...',
      totalResults: searchResults.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ 
      error: "RAG test failed", 
      details: String(err) 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
