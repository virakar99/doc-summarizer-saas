import { getDocument } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { FileText, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"

// Force dynamic rendering - don't prerender this page
export const dynamic = "force-dynamic"

interface DocumentPageProps {
  params: {
    id: string
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  // Check authentication first
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  let document

  try {
    document = await getDocument(params.id)
  } catch (error) {
    console.error("Error fetching document:", error)
    notFound()
  }

  if (!document) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/dashboard/history">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{document.file_name}</h1>
            <p className="text-gray-600">
              Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })} •
              {(document.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">File Name</p>
                <p className="text-sm text-gray-600">{document.file_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">File Type</p>
                <p className="text-sm text-gray-600">{document.file_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">File Size</p>
                <p className="text-sm text-gray-600">{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Upload Date</p>
                <p className="text-sm text-gray-600">{new Date(document.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {document.summaries && document.summaries.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
              <CardDescription>
                Generated {formatDistanceToNow(new Date(document.summaries[0].created_at), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{document.summaries[0].content}</div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Summary Available</h3>
              <p className="text-gray-500 mb-4">This document hasn't been summarized yet.</p>
              <Link href="/dashboard">
                <Button>Generate Summary</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
