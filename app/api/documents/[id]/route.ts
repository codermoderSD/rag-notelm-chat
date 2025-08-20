import { NextRequest, NextResponse } from "next/server";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id") || "";
    const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");
    const userId = req.headers.get("X-User-ID");

    // Initialize the Qdrant store with existing collection
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        new GoogleGenerativeAIEmbeddings({
            apiKey: apiKey,
            model: "text-embedding-004",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
            title: "Document title",
        }),
        {
            url: process.env.QDRANT_URL!,
            collectionName: `notelm_${userId}`,
            apiKey: process.env.QUADRANT_API_KEY,
        }
    );

    // Delete vector by ID
    await vectorStore.delete({
        ids: [id],
    });

    return NextResponse.json({ success: true, deletedId: id });
}
