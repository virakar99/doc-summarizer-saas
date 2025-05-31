"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Download, Loader2, Sparkles } from "lucide-react"
import { useChat } from "ai/react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/summarize",
    onFinish: (message) => {
      console.log("Summary completed:", message)
      toast({
        title: "Summary completed",
        description: "Your document has been successfully summarized.",
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

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { text } = await response.json()
        setExtractedText(text)
        toast({
          title: "Text extracted",
          description: "Your document has been processed successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to extract text")
      }
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

  const handleSummarize = (e: React.FormEvent) => {
    e.preventDefault()
    if (!extractedText.trim()) return

    const summaryPrompt = `Please provide a comprehensive summary of the following document:\n\n${extractedText}`

    // Include document info for database storage
    const documentInfo = file
      ? {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }
      : null

    handleSubmit(e, {
      data: {
        prompt: summaryPrompt,
        documentInfo,
      },
    })
  }

  const handleDownloadSummary = () => {
    const latestSummary = messages.filter((m) => m.role === "assistant").pop()
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

  const latestSummary = messages.filter((m) => m.role === "assistant").pop()

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Summarizer</h1>
        <p className="text-gray-600">Upload your document and get an AI-powered summary in seconds</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload Document
            </CardTitle>
            <CardDescription>Support for PDF, Word documents, and text files (max 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Click to upload or drag and drop</p>
                  <p className="text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                </label>
              </div>

              {file && (
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">{file.name}</p>
                    <p className="text-sm text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {isExtracting && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                </div>
              )}

              {extractedText && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Extracted Text Preview</label>
                    <Textarea
                      value={extractedText.substring(0, 500) + (extractedText.length > 500 ? "..." : "")}
                      readOnly
                      className="h-32"
                    />
                  </div>

                  <Button onClick={handleSummarize} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Summary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              AI Summary
            </CardTitle>
            <CardDescription>Your document summary will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your document...</p>
                </div>
              </div>
            ) : latestSummary ? (
              <div className="space-y-4">
                <div className="prose max-w-none">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">Document Summary</h3>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{latestSummary.content}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadSummary}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Summary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(latestSummary.content)
                      toast({
                        title: "Copied to clipboard",
                        description: "Summary has been copied to clipboard.",
                      })
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload a document to get started</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
