"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface Document {
  id: string;
  type: "text" | "pdf" | "website";
  title: string;
  content?: string;
  url?: string;
  size?: number;
  status: "uploading" | "ready" | "error";
  error?: string;
  file?: File;
  apiKey?: string;
  provider?: string;
  userId?: string;
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, "id" | "status">) => Promise<void>;
  removeDocument: (id: string, apiKey: string, userId: string) => void;
  isUploading: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /** Create a .txt file from string */
  const createTxtFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    return new File([blob], filename.endsWith(".txt") ? filename : `${filename}.txt`, {
      type: "text/plain",
    });
  };

  /** Add new document */
  const addDocument = async (docData: Omit<Document, "id" | "status">) => {
    const tempId = Date.now().toString() + Math.random();
    const newDoc: Document = {
      ...docData,
      id: tempId,
      status: "uploading",
    };

    setDocuments((prev) => [...prev, newDoc]);
    setIsUploading(true);

    try {
      let response;

      if (docData.type === "pdf" && docData.file) {
        // Handle PDF upload
        const formData = new FormData();
        formData.append("type", "pdf");
        formData.append("file", docData.file);
        formData.append("title", docData.title || docData.file.name);
        formData.append("provider", docData.provider || "");
        formData.append("apiKey", docData.apiKey || "");
        formData.append("userId", docData.userId || "");

        response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      } else if (docData.type === "text" && docData.content) {
        // Convert text to .txt file and upload as FormData
        const textFile = createTxtFile(docData.content, docData.title || "document.txt");
        const formData = new FormData();
        formData.append("type", "text");
        formData.append("file", textFile);
        formData.append("title", docData.title || textFile.name);
        formData.append("provider", docData.provider || "");
        formData.append("apiKey", docData.apiKey || "");
        formData.append("userId", docData.userId || "");

        response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        // Website or fallback
        response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: docData.type,
            content: docData.content,
            url: docData.url,
            filename: docData.title,
            provider: docData.provider,
            apiKey: docData.apiKey,
            userId: docData.userId,
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const result = await response.json();

      setDocuments((prev) =>
        prev.map((doc) => {
          let newId = result.documentId;
          if (!newId || typeof newId !== "string" || newId === "undefined") {
            newId = tempId;
          }
          return doc.id === tempId ? { ...doc, status: "ready" as const, id: newId } : doc;
        })
      );
    } catch (error) {
      console.error("Error uploading document:", error);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === tempId ? { ...doc, status: "error" as const, error: "Failed to upload document" } : doc
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  /**  Remove document */
  const removeDocument = async (id: string, apiKey: string, userId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    await fetch(`/api/documents/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-ID": userId,
      },
    });
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, removeDocument, isUploading }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
}
