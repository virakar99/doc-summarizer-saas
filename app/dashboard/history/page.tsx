import { getUserDocuments } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { FileText, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"

export default async function HistoryPage() {
  const documents = await getUserDocuments()

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document History</h1>
        <p className="text-gray-600">View and access your previously summarized documents</p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No documents yet</h3>
          <p className="text-gray-500 mb-4">You haven't summarized any documents yet.</p>
          <Link href="/dashboard">
            <Button>Summarize Your First Document</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{doc.file_name}</CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })} •
                      {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/document/${doc.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {doc.summaries && doc.summaries.length > 0 ? (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-1">Summary Preview</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{doc.summaries[0].content}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No summary available</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
