import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { DocxLoader } from "langchain/document_loaders/fs/docx"
import { TextLoader } from "langchain/document_loaders/fs/text"

export async function extractTextFromBuffer(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  try {
    // Create a Blob from the buffer
    const blob = new Blob([buffer], { type: mimeType })

    // Convert the Blob to a File
    const file = new File([blob], fileName, { type: mimeType })

    let text = ""

    if (mimeType === "application/pdf") {
      const loader = new PDFLoader(file)
      const docs = await loader.load()
      text = docs.map((doc) => doc.pageContent).join("\n\n")
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const loader = new DocxLoader(file)
      const docs = await loader.load()
      text = docs.map((doc) => doc.pageContent).join("\n\n")
    } else if (mimeType === "text/plain") {
      const loader = new TextLoader(file)
      const docs = await loader.load()
      text = docs.map((doc) => doc.pageContent).join("\n\n")
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`)
    }

    return text
  } catch (error) {
    console.error("Error extracting text:", error)
    throw new Error(`Failed to extract text from ${fileName}: ${error.message}`)
  }
}
