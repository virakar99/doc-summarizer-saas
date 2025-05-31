import type React from "react"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { FileText, History, Settings, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-indigo-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">DocSummarize AI</span>
                </div>
              </Link>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4">
          <nav className="space-y-1">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-5 w-5 mr-3" />
                Summarize
              </Button>
            </Link>
            <Link href="/dashboard/history">
              <Button variant="ghost" className="w-full justify-start">
                <History className="h-5 w-5 mr-3" />
                History
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" className="w-full justify-start">
                <CreditCard className="h-5 w-5 mr-3" />
                Upgrade
              </Button>
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
