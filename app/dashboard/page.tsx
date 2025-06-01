"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Sparkles, Loader2, Download, Copy } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const { toast } = useToast()

  const { messages, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/summarize",
    onFinish: () => {
      toast({
        title: "Summary completed!",
        description: "Your document has been successfully summarized.",
      })
    },
    onError: (error) => {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setIsExtracting(true)
    setExtractedText("")
    setMessages([]) // Clear previous messages

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to extract text")
      }

      const data = await response.json()
      setExtractedText(data.text)

      toast({
        title: "Text extracted successfully!",
        description: "You can now generate a summary.",
      })
    } catch (error) {
      console.error("Error extracting text:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to extract text from document.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!extractedText.trim()) {
      toast({
        title: "No text to summarize",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    // Create a message with the extracted text
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: `Please provide a comprehensive summary of the following document:\n\n${extractedText}`,
    }

    // Submit to the chat API
    handleSubmit(e, {
      data: {
        messages: [userMessage],
      },
    })
  }

  const latestSummary = messages.filter((m) => m.role === "assistant").pop()

  const handleDownload = () => {
    if (!latestSummary) return

    const blob = new Blob([latestSummary.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `summary-${file?.name || "document"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!latestSummary) return

    try {
      await navigator.clipboard.writeText(latestSummary.content)
      toast({
        title: "Copied to clipboard!",
        description: "Summary has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Summarizer</h1>
        <p className="text-gray-600">Upload your documents and get AI-powered summaries instantly</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <CardDescription>Upload a PDF, Word document, or text file (max 10MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isExtracting}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {isExtracting ? (
                      <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                    ) : (
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {isExtracting ? "Extracting text..." : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                  </label>
                </div>

                {file && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">{file.name}</p>
                        <p className="text-sm text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {extractedText && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Text</CardTitle>
                <CardDescription>Review and edit the extracted text before summarization</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here..."
                  className="min-h-[200px] mb-4"
                />
                <Button onClick={handleSummarize} disabled={isLoading || !extractedText.trim()} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Summary
              </CardTitle>
              <CardDescription>Your document summary will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Analyzing your document...</p>
                  </div>
                </div>
              ) : latestSummary ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Document Summary</h3>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{latestSummary.content}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload a document to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
