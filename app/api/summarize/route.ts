import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { auth } from "@clerk/nextjs/server"
import { createDocument, createSummary } from "@/lib/db"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, documentInfo } = await req.json()

    // Create document record in database
    let documentId: string | undefined

    if (documentInfo) {
      const document = await createDocument({
        fileName: documentInfo.fileName,
        fileType: documentInfo.fileType,
        fileSize: documentInfo.fileSize,
      })
      documentId = document.id
    }

    const result = await streamText({
      model: openai("gpt-4o"),
      messages,
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
      onFinish: async (result) => {
        // Save summary to database if we have a document ID
        if (documentId) {
          await createSummary({
            documentId,
            content: result.text,
          })
        }
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in summarize API:", error)
    return new Response("Error processing request", { status: 500 })
  }
}
