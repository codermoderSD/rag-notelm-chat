import { type NextRequest, NextResponse } from "next/server";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import fs from "fs";
import path from "path";

interface UploadRequest {
  type: "text" | "pdf" | "website";
  content?: string;
  url?: string;
  filename?: string;
}

const LoaderMap: Record<string, any> = {
  text: TextLoader,
  pdf: PDFLoader,
  website: PuppeteerWebBaseLoader,
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let body: any = {};
    let fileBuffer: Buffer | null = null;
    let filename: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body.type = formData.get("type") as string;
      filename = formData.get("title") as string;
      body.apiKey = formData.get("apiKey") as string;
      body.provider = formData.get("provider") as string;

      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "File is required for upload" }, { status: 400 });
      }

      // Convert to Buffer
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      body = await request.json();
    }

    const { type, content, url, apiKey, provider } = body;

    if (!["pdf", "text", "website"].includes(type)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    if ((type === "pdf" || type === "text") && !fileBuffer) {
      return NextResponse.json({ error: `No file found for ${type}` }, { status: 400 });
    }

    let tempFilePath: string | undefined;

    if ((type === "pdf" || type === "text") && fileBuffer) {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      const ext = type === "pdf" ? ".pdf" : ".txt";
      tempFilePath = path.join(uploadDir, filename || `upload-${Date.now()}${ext}`);
      fs.writeFileSync(tempFilePath, fileBuffer);
    }

    const result = await processDocumentForRAG(type, {
      content,
      url,
      filename: tempFilePath || filename,
      apiKey,
      provider,
    });

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      message: "Document processed successfully",
    });
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}

async function processDocumentForRAG(
  type: string,
  data: { content?: string; url?: string; filename?: string; apiKey?: string; provider?: string }
): Promise<{ documentId: string }> {
  // Load document
  let loader;

  if (type === "website" && data.url) {
    loader = new PuppeteerWebBaseLoader(data.url);
  } else if ((type === "pdf" || type === "text") && data.filename) {
    const LoaderClass = LoaderMap[type];
    loader = new LoaderClass(data.filename);
  } else if (type === "text" && data.content) {
    return {
      documentId: "text-content-direct",
    };
  } else {
    throw new Error("Invalid document data");
  }

  const docs = await loader.load();

  //  Split content
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const output = await splitter.splitDocuments(docs);

  //  Generate embeddings
  let embeddings;
  if (data.provider === "google" || !data.provider) {
    embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: data.apiKey,
      model: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
    });
  }

  if (!embeddings) {
    throw new Error("Unsupported provider or missing embeddings implementation.");
  }

  // Store embeddings in Qdrant
  const vectorStore = await QdrantVectorStore.fromDocuments(output, embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "notelm",
    apiKey: process.env.QUADRANT_API_KEY,
  });

  // Generate unique documentId
  const documentId = Date.now().toString();

  return {
    documentId,
  };
}

export async function GET() {
  return NextResponse.json({
    documents: [],
    message: "Document listing will be implemented with RAG system",
  });
}
