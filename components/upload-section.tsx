"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X, FileText, Globe, Upload, Plus, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useDocuments } from "@/contexts/document-context"
import { getUserId } from "@/lib/utils"

export function UploadSection() {
  // Gemini API Key state
  const [apiKeyInput, setApiKeyInput] = useState<string>(typeof window !== "undefined" ? localStorage.getItem("apiKey") || "" : "");
  const [userId, setUserId] = useState<string>(typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiKeyInput(localStorage.getItem("apiKey") || "");
      const userid = getUserId();
      localStorage.setItem("userId", userid);
      setUserId(userid);
    }
  }, []);

  // Save API key to localStorage
  const handleApiKeySave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKeyInput(apiKeyInput);
    if (typeof window !== "undefined") {
      localStorage.setItem("apiKey", apiKeyInput);
    }
    setApiKeyInput("");
  };

  const { documents, addDocument, removeDocument, isUploading } = useDocuments();
  // Source limit logic (must be after useDocuments)
  const SOURCE_LIMIT = 3;
  const sourcesCount = documents.length;
  const isSourceLimitReached = sourcesCount >= SOURCE_LIMIT;
  const [textInput, setTextInput] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  const addTextDocument = async () => {
    if (!apiKeyInput) {
      alert("Please add your Gemini API key first.");
      return;
    }
    if (!textInput.trim() || isSourceLimitReached) return;
    await addDocument({
      type: "text",
      title: `Text Document ${documents.filter((d) => d.type === "text").length + 1}`,
      content: textInput,
      apiKey: apiKeyInput,
      userId: userId,
    });
    setTextInput("");
  }

  const addWebsiteDocument = async () => {
    if (!apiKeyInput) {
      alert("Please add your Gemini API key first.");
      return;
    }
    if (!websiteUrl.trim() || isSourceLimitReached) return;
    try {
      const hostname = new URL(websiteUrl).hostname;
      await addDocument({
        type: "website",
        title: hostname,
        url: websiteUrl,
        apiKey: apiKeyInput,
        userId: userId,
      });
      setWebsiteUrl("");
    } catch (error) {
      console.error("Invalid URL:", error);
    }
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (!apiKeyInput) {
      alert("Please add your Gemini API key first.");
      return;
    }
    for (const file of Array.from(files)) {
      if (isSourceLimitReached) {
        alert("You can only add up to 3 sources.");
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum allowed size is 5MB.`);
        continue;
      }
      if (file.type === "application/pdf") {
        await addDocument({
          type: "pdf",
          title: file.name,
          size: file.size,
          file: file,
          apiKey: apiKeyInput,
          userId: userId,
        });
      }
    }

    // Reset input
    event.target.value = "";
  }

  const getDocumentIcon = (type: "text" | "pdf" | "website") => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "website":
        return <Globe className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: "uploading" | "ready" | "error") => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-black">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-800">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Sources</h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">Add documents, text, or websites to chat with</p>
      </div>

      {/* Upload Interface */}
      <div className="flex-1 p-4 md:p-6 min-h-0">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-800">
            <TabsTrigger
              value="text"
              className="text-gray-300 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              Text
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              className="text-gray-300 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              PDF
            </TabsTrigger>
            <TabsTrigger
              value="website"
              className="text-gray-300 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              Website
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Add Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="text-input" className="text-gray-300">
                    Paste your text here
                  </Label>
                  <Textarea
                    id="text-input"
                    placeholder="Paste any text content you want to chat with..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-32 mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={addTextDocument}
                  disabled={!textInput.trim() || isUploading}
                  className="w-full bg-white hover:bg-gray-100 text-black"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add Text
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Upload PDF</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Clickable upload area */}
                <div
                  className="border-2 border-dashed border-gray-700 rounded-lg p-6 md:p-8 text-center hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                >
                  <Upload className="h-8 md:h-12 w-8 md:w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-300 font-medium mb-2">Click to upload PDF files</p>
                  <p className="text-xs text-gray-400">Supports PDF files up to 10MB</p>
                </div>

                {/* Hidden file input */}
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="website" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Add Website</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website-url" className="text-gray-300">
                    Website URL
                  </Label>
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={addWebsiteDocument}
                  disabled={!websiteUrl.trim() || isUploading}
                  className="w-full bg-white hover:bg-gray-100 text-black"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add Website
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documents List */}
        <div className="mt-3 md:mt-4">
          <h3 className="text-xs font-medium mb-4 text-gray-400">Added Sources ({sourcesCount}/{SOURCE_LIMIT})</h3>
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <Card key={doc.id} className="p-3 md:p-4 bg-gray-900 border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="text-gray-400">{getDocumentIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">{doc.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                          {doc.type.toUpperCase()}
                        </Badge>
                        {doc.size && <span className="text-xs text-gray-400">{formatFileSize(doc.size)}</span>}
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(doc.status)}
                          <span className="text-xs text-gray-400 capitalize">{doc.status}</span>
                        </div>
                      </div>
                      {doc.status === "error" && doc.error && (
                        <p className="text-xs text-red-400 mt-1">{doc.error}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(doc.id, apiKeyInput, userId)}
                    disabled={doc.status === "uploading"}
                    className="text-gray-400 hover:text-red-400 hover:bg-gray-800 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {/* Google API Key Form */}
      <div className="m-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent>
            <div className="space-y-2">
              {!apiKeyInput ? <form onSubmit={handleApiKeySave} className="space-y-4">
                <Label htmlFor="google-api-key" className="text-gray-300">
                  Enter your Gemini API Key
                </Label>
                <Input
                  id="google-api-key"
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API Key here"
                  className="mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button type="submit" className="bg-white hover:bg-gray-100 text-black">Save API Key</Button>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 underline block mt-2"
                >
                  Get a free Gemini API key here
                </a>
              </form> : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-400 mt-2">API Key saved! You can now use unlimited requests.</p>
                  <Button size="sm" variant="outline" className="ml-2" onClick={() => setApiKeyInput("")}>
                    Change Key
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
