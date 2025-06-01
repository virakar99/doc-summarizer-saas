import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { auth } from "@clerk/nextjs/server"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = auth()

    if (!userId) {
      console.error("No user ID found")
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse request body
    const body = await req.json()
    const { messages } = body

    console.log("Received request:", { userId, messagesCount: messages?.length })

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found")
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Generate summary using AI SDK
    const result = await streamText({
      model: openai("gpt-4o-mini"), // Using mini model for cost efficiency
      messages: messages || [{ role: "user", content: "Please provide a summary." }],
      system: `You are an expert document summarizer. Create clear, concise summaries that capture the main points. Use bullet points when appropriate and focus on key insights and actionable information.`,
      temperature: 0.3,
      maxTokens: 1000,
    })

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
