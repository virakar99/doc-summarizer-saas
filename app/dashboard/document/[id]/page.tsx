import { getDocument } from "@/lib/db"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const document = await getDocument(params.id).catch(() => null)

  if (!document) {
    notFound()
  }

  const summary = document.summaries?.[0]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/dashboard/history" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to History
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{document.file_name}</h1>
        <p className="text-gray-600">
          Summarized on {new Date(document.created_at).toLocaleDateString()} •
          {(document.file_size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      <div className="grid gap-6">
        {summary ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">Document Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
                  <div className="whitespace-pre-wrap">{summary.content}</div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No summary available for this document.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
