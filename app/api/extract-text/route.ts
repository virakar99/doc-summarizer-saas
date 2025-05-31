import { type NextRequest, NextResponse } from "next/server"
import { extractTextFromBuffer } from "@/lib/document-parser"
import { auth } from "@clerk/nextjs/server"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract text from the file
    const text = await extractTextFromBuffer(buffer, file.name, file.type)

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error extracting text:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
