"use client"

import { useState } from "react"
import { UploadSection } from "@/components/upload-section"
import { ChatSection } from "@/components/chat-section"
import { DocumentProvider } from "@/contexts/document-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Home() {
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false)

  return (
    <DocumentProvider>
      <div className="flex h-screen bg-black text-white">
        {/* Upload Section - Collapsible Left Side */}
        <div
          className={`${isSourcesCollapsed ? "w-0 md:w-12" : "w-full md:w-96 lg:w-1/3"
            } transition-all duration-300 ease-in-out border-r border-gray-800 relative`}
        >
          {/* Collapse Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSourcesCollapsed(!isSourcesCollapsed)}
            className={`absolute top-4 ${isSourcesCollapsed ? "left-2" : "right-4"
              } z-10 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white`}
          >
            {isSourcesCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {/* Upload Section Content */}
          <div className={`${isSourcesCollapsed ? "hidden" : "block"} h-full`}>
            <UploadSection />
          </div>
        </div>

        {/* Chat Section - Right Side */}
        <div className="flex-1 min-w-0">
          <ChatSection />
        </div>
      </div>
    </DocumentProvider>
  )
}
