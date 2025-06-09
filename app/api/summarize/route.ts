import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { auth } from "@clerk/nextjs/server"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    console.log("=== Summarize API called ===")

    // Check authentication
    const { userId } = auth()
    console.log("User ID:", userId)

    if (!userId) {
      console.error("No user ID found")
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse request body
    const body = await req.json()
    console.log("Request body:", body)

    // Extract messages from the request
    const messages = body.messages || []
    console.log("Messages received:", messages.length)

    if (messages.length === 0) {
      console.error("No messages provided")
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found")
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("Starting AI generation...")

    // Generate summary using AI SDK
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: messages,
      system: `You are an expert document summarizer. Your task is to create comprehensive, well-structured summaries of documents.

Guidelines:
- Create clear, concise summaries that capture the main points
- Use bullet points or numbered lists when appropriate  
- Highlight key insights, conclusions, and important details
- Maintain the original context and meaning
- Structure your summary with clear sections if the document is long
- Focus on actionable information and key takeaways

Format your response in a clear, readable manner with proper headings and organization.`,
      temperature: 0.3,
      maxTokens: 1000,
    })

    console.log("AI generation successful, returning stream")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in summarize API:", error)

    // Return detailed error for debugging
    return new Response(
      JSON.stringify({
        error: "Failed to generate summary",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
