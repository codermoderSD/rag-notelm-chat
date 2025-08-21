import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatRequest {
  message: string
  history: Message[]
  apiKey: string
  provider: string
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history, apiKey, provider, userId } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const response = await processMessageWithRAG(message, history, apiKey, provider, userId)

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processMessageWithRAG(message: string, history: Message[], apiKey: string, provider: string, userId: string): Promise<string> {
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
  });

  // Create embeddings
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document title",
    apiKey: apiKey,
  });

  // Query your Qdrant vector database for relevant documents
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: `notelm_${userId}`,
      // apiKey: process.env.QUADRANT_API_KEY,
    }
  );

  console.log("Vector store:", vectorStore);

  // Search for relevant documents
  const vectorSearcher = vectorStore.asRetriever({
    k: 4,
  })

  const relevantChunks = await vectorSearcher.invoke(message)

  // For now, return a placeholder response
  const systemPrompt = [
    `You are an AI assistant who helps resolving user queries based on the context available to you from a document with the content and page number. 
    Only answer based on the available context from relevant documents and chat history only.
    Context: ${JSON.stringify(relevantChunks, null, 2)}
    `,
  ]

  const completion = await client.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt.join("\n") },
      ...history,
      { role: "user", content: message }
    ]
  });

  return completion.choices[0].message.content || "No relevant information found in the documents.";
}
