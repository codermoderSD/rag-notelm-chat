"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { useDocuments } from "@/contexts/document-context"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function IndexingLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="relative mb-6">
        {/* Animated brain/neural network visualization */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full border-2 border-white/50 animate-ping"></div>
          <div className="absolute inset-4 rounded-full border-2 border-white/70 animate-spin"></div>
          <div className="absolute inset-6 rounded-full bg-white/20 animate-bounce"></div>
          <Bot className="absolute inset-0 m-auto h-8 w-8 text-white" />
        </div>

        {/* Floating particles */}
        <div className="absolute -top-2 -left-2 w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
        <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-300"></div>
        <div className="absolute -bottom-2 -left-3 w-1 h-1 bg-white rounded-full animate-bounce delay-500"></div>
        <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-white rounded-full animate-bounce delay-700"></div>
      </div>

      <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Processing Your Documents</h3>
      <p className="text-gray-400 mb-4 max-w-md">
        I'm analyzing and indexing your sources to provide better answers. This usually takes a few moments.
      </p>

      {/* Progress dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  )
}

export function ChatSection() {
  const { documents } = useDocuments()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [apiKeyInput, setApiKeyInput] = useState<string>(typeof window !== "undefined" ? localStorage.getItem("apiKey") || "" : "");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiKeyInput(localStorage.getItem("apiKey") || "");
    }
  }, []);


  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          history: messages,
          provider: "google",
          apiKey: apiKeyInput,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I'm sorry, I couldn't process your request right now.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, there was an error processing your message. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const readyDocuments = documents.filter((doc) => doc.status === "ready")
  const uploadingDocuments = documents.filter((doc) => doc.status === "uploading")
  const hasDocuments = readyDocuments.length > 0
  const isIndexing = uploadingDocuments.length > 0

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-800">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Chat</h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          {hasDocuments
            ? `Ask questions about your ${readyDocuments.length} uploaded document${readyDocuments.length > 1 ? "s" : ""}`
            : "Upload some documents to start chatting"}
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 md:p-6 overflow-y-auto" ref={scrollAreaRef}>
        {isIndexing ? (
          <IndexingLoader />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {hasDocuments ? "Ready to help!" : "Upload documents to get started"}
            </h3>
            <p className="text-sm text-gray-400 max-w-md">
              {hasDocuments
                ? "I can now answer questions about your uploaded documents. Ask me anything!"
                : "Upload some documents on the left and start asking questions. I'll help you find information and insights from your sources."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-1 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-white text-black">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <Card
                  className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 ${message.role === "user"
                    ? "bg-white text-black ml-8 md:ml-12"
                    : "bg-gray-900 text-gray-100 mr-8 md:mr-12 border-gray-800"
                    }`}
                >
                  <div className="text-sm markdown-content">
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                        components={{
                          // Customize styling for different markdown elements
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-md font-bold my-2" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-bold my-1" {...props} />,
                          a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          pre: ({ node, ...props }) => (
                            <pre className="bg-gray-900 p-2 rounded-md my-2 overflow-auto text-xs" {...props} />
                          ),
                          code: ({ className, children, ...props }: React.HTMLProps<HTMLElement> & { className?: string }) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const isCodeBlock = match && match.length > 1
                            if (!isCodeBlock) {
                              return <code className="bg-[#1e1e1e] border border-[#333] px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                            }
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : message.content}
                  </div>
                  <div
                    className={`text-xs mt-2 opacity-70 ${message.role === "user" ? "text-gray-600" : "text-gray-400"}`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </Card>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gray-700 text-gray-300">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-1 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-white text-black">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-gray-900 text-gray-100 p-3 md:p-4 mr-8 md:mr-12 border-gray-800">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              hasDocuments ? "Ask a question about your documents..." : "Upload documents first to start chatting..."
            }
            disabled={isLoading || !hasDocuments || isIndexing}
            className="flex-1 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || !hasDocuments || isIndexing}
            size="icon"
            className="bg-white hover:bg-gray-100 text-black"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {isIndexing
            ? "Processing documents... Please wait"
            : hasDocuments
              ? "Press Enter to send, Shift+Enter for new line"
              : "Upload documents on the left to enable chat"}
        </p>
      </div>
    </div>
  )
}
