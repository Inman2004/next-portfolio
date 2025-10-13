import { NextRequest } from "next/server";
import { HfInference } from "@huggingface/inference";

export const runtime = "nodejs";

// Initialize the Hugging Face Inference client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

type Msg = { role: "user" | "assistant" | "system"; content: string };

/**
 * Generates a response from the custom fine-tuned Hugging Face model.
 * @param messages The conversation history, including the system prompt.
 * @returns The AI's response.
 */
async function generateMimirResponse(messages: Msg[]): Promise<string> {
  try {
    // This is the custom-tuned model, hosted on Hugging Face Hub.
    // The name is a placeholder for the user's actual model.
    const model = "Inman2004/mimir-gemma-270m-it";

    const response = await hf.chatCompletion({
      model,
      messages,
      parameters: {
        max_new_tokens: 512, // Increased max tokens for more detailed answers if needed
        temperature: 0.8,    // Slightly increased for more natural-sounding responses
        top_p: 0.9,
        repetition_penalty: 1.15,
      },
    });

    return response.choices[0].message.content ?? '';
  } catch (error) {
    console.error("Hugging Face API error:", error);
    if (process.env.NODE_ENV === 'production') {
      return "My apologies, I'm having trouble accessing my knowledge base at the moment. Please notify the administrator if this issue persists.";
    } else {
      return "Hugging Face API call failed. This could be due to a missing or invalid HUGGINGFACE_API_KEY, or the specified model is not available. Please check your environment variables and model repository.";
    }
  }
}

/**
 * Extracts the last user message from the conversation history.
 * @param messages The conversation history.
 * @returns The content of the last user message, or null.
 */
function lastUserMessage(messages: Msg[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content || "";
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages: Msg[] };

    if (!body?.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "Invalid request body: 'messages' array not found." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // The system prompt defines Mimir's persona, knowledge base, and rules.
    const systemPrompt = {
      role: "system",
      content: `You are Mimir, an AI assistant created by Immanuvel to share knowledge about his work. Like your namesake from the ancient tales, you draw from a well of information. Your tone is knowledgeable, helpful, and slightly formal.

      Your Rules:
      1. You must only answer questions based on the data you were trained on, which includes Immanuvel's resume, projects, skills, and experiences.
      2. If a question cannot be answered from your training data (e.g., about his current salary, personal opinions not in the data), you must politely state that you do not have that information.
      3. Your primary goal is to act as an expert on Immanuvel's professional profile.`
    };

    // Prepend the system prompt to the message history from the client.
    const messagesForApi: Msg[] = [systemPrompt, ...body.messages];

    const reply = await generateMimirResponse(messagesForApi);

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("/api/chat error", err);
    return new Response(JSON.stringify({ error: "An unexpected server error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
