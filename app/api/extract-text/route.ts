import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("Processing file:", { name: file.name, type: file.type, size: file.size })

    // For now, let's handle text files and provide sample text for others
    let extractedText = ""

    if (file.type === "text/plain") {
      // Handle actual text files
      extractedText = await file.text()
    } else if (file.type === "application/pdf") {
      // Placeholder for PDF files
      extractedText = `This is a sample PDF document content for "${file.name}". 

Key Points:
• This document discusses important business strategies
• Market analysis shows significant growth potential  
• Recommendations include expanding digital presence
• Financial projections indicate 25% revenue increase
• Implementation timeline spans 6 months

The document contains detailed analysis of market trends, competitive landscape, and strategic recommendations for business growth. It emphasizes the importance of digital transformation and customer-centric approaches.

This is placeholder text that demonstrates the AI summarization capability. In production, this would be replaced with actual PDF text extraction.`
    } else if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      // Placeholder for Word documents
      extractedText = `This is a sample Word document content for "${file.name}".

Executive Summary:
The quarterly report shows strong performance across all departments. Revenue has increased by 15% compared to the previous quarter, with particular strength in the technology and services sectors.

Key Achievements:
• Successfully launched three new product lines
• Expanded into two new geographic markets
• Improved customer satisfaction scores by 12%
• Reduced operational costs by 8%

Challenges and Opportunities:
While we've seen significant growth, there are areas for improvement. Supply chain disruptions have affected delivery times, and we need to invest in better inventory management systems.

Future Outlook:
The next quarter looks promising with several major contracts in the pipeline. We expect continued growth and are optimistic about reaching our annual targets.

This is placeholder text that demonstrates the AI summarization capability. In production, this would be replaced with actual Word document text extraction.`
    } else {
      return new Response(JSON.stringify({ error: "Unsupported file type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ text: extractedText }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error extracting text:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to extract text",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
