"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Sparkles, Loader2, Download, Copy, X, AlertCircle } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const { toast } = useToast()

  const { messages, handleSubmit, isLoading, setMessages, error } = useChat({
    api: "/api/summarize",
    onFinish: (message) => {
      console.log("Chat finished:", message)
      toast({
        title: "Summary completed!",
        description: "Your document has been successfully summarized.",
      })
    },
    onError: (error) => {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: `Failed to generate summary: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  console.log("Current messages:", messages)
  console.log("Is loading:", isLoading)
  console.log("Error:", error)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    console.log("File selected:", selectedFile.name, selectedFile.type, selectedFile.size)

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

      console.log("Sending file to extract-text API...")

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      console.log("Extract-text response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Extract-text error:", errorData)
        throw new Error(errorData.error || "Failed to extract text")
      }

      const data = await response.json()
      console.log("Text extracted successfully, length:", data.text?.length)
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

  const handleRemoveFile = () => {
    setFile(null)
    setExtractedText("")
    setMessages([])

    // Reset file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }

    toast({
      title: "File removed",
      description: "You can upload a new document.",
    })
  }

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== Starting summarization ===")
    console.log("Extracted text length:", extractedText.length)

    if (!extractedText.trim()) {
      toast({
        title: "No text to summarize",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    // Create the message content
    const messageContent = `Please provide a comprehensive summary of the following document:\n\n${extractedText}`

    console.log("Message content created, length:", messageContent.length)

    // Create a form event with the message
    const formData = new FormData()
    formData.append("message", messageContent)

    // Create a synthetic form event
    const syntheticEvent = {
      ...e,
      currentTarget: {
        message: { value: messageContent },
      },
    } as any

    console.log("Calling handleSubmit...")

    // Call handleSubmit with the synthetic event
    handleSubmit(syntheticEvent)
  }

  const latestSummary = messages.filter((m) => m.role === "assistant").pop()
  console.log("Latest summary:", latestSummary?.content?.substring(0, 100))

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
                {!file ? (
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
                ) : (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-900">{file.name}</p>
                          <p className="text-sm text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show extracted text preview */}
                {extractedText && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">Extracted Text Preview</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {extractedText.substring(0, 200)}
                        {extractedText.length > 200 && "..."}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{extractedText.length} characters extracted</p>
                    </div>

                    {/* Generate Summary Button */}
                    <Button
                      onClick={handleSummarize}
                      disabled={isLoading || !extractedText.trim()}
                      className="w-full"
                      size="lg"
                    >
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
                  </div>
                )}

                {/* Show error if no text extracted */}
                {file && !isExtracting && !extractedText && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">No text could be extracted from this file.</p>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Please try uploading a different file or a text-based document.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Editable Text Area (only show if text is extracted) */}
          {extractedText && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Extracted Text</CardTitle>
                <CardDescription>You can edit the text before generating a summary</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here..."
                  className="min-h-[200px]"
                />
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
                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
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
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                  <p className="text-lg font-medium text-red-600 mb-2">Error generating summary</p>
                  <p className="text-sm text-red-500">{error.message}</p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No summary yet</p>
                  <p className="text-sm">Upload a document and click "Generate Summary" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === "development" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <p>Messages: {messages.length}</p>
                  <p>Is Loading: {isLoading.toString()}</p>
                  <p>Has Error: {error ? "Yes" : "No"}</p>
                  <p>Extracted Text Length: {extractedText.length}</p>
                  <p>Latest Summary: {latestSummary ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <p>Upload a PDF, Word document, or text file</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <p>Review the extracted text (edit if needed)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <p>Click "Generate Summary" to get AI-powered insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
