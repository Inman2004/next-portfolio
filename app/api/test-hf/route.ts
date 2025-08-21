import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const apiKey = process.env.HuggingFace_API_KEY || process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No API key found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Test with a definitely available model
    const res = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Next.js/15.0.0",
      },
      body: JSON.stringify({
        inputs: "Hello",
        parameters: { max_new_tokens: 10 }
      }),
      // Add timeout and other fetch options
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(JSON.stringify({ 
        error: `HF API error: ${res.status}`,
        details: errorText,
        status: res.status
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify({ 
      success: true, 
      model: "gpt2",
      response: data 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      error: "Request failed", 
      details: String(err) 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
