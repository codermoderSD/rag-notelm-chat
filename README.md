# **NoteLM**

NoteLM is a **NotebookLM-inspired app** built to explore **Retrieval-Augmented Generation (RAG)** in a practical way. It helps users manage and interact with their documents by enabling contextual AI-powered conversations. The app is powered by **Next.js**, **LangChain**, and **Qdrant**.

---

## **Demo**

[![Watch the demo](https://img.youtube.com/vi/QMz2WTRlKyg/0.jpg)](https://www.youtube.com/watch?v=QMz2WTRlKyg)

---

## **Features**

* Upload PDFs, add website URLs, or input text for analysis
* Generate context-aware responses using RAG
* Simple and clean chat interface for easy interaction

---

## **Tech Stack**

* **Next.js** – Frontend framework
* **LangChain** – For building the RAG workflow
* **Qdrant** – Vector database for storing embeddings
* **OpenAI or any LLM** – For response generation

---

## **Why I Built This**

This project was a hands-on way to learn **Generative AI with JavaScript**.
Key things I explored:

* How vector databases like Qdrant store and retrieve embeddings
* How LangChain orchestrates the RAG pipeline
* Handling multiple content types (PDF, web, text) effectively

---

## **Future Scope**

* Multi-language document support
* Advanced document analysis (summarization, insights, semantic search)
* Customizable chat interface
* Deployment for public use with optimizations

---

## **Setup Instructions**

### **1. Clone the repository**

```bash
git clone https://github.com/codermoderSD/rag-notelm-chat
cd rag-notelm-chat
```

### **2. Install dependencies**

```bash
pnpm install
```

### **3. Start Qdrant using Docker**

Ensure you have Docker and Docker Compose installed. Then run:

```bash
docker-compose up -d
```

This will start Qdrant locally at:

```
http://localhost:6333
```

To view the **Qdrant dashboard** and inspect your collections:

```
http://localhost:6333/dashboard
```

> **Note:** For local setup, you do **not** need an API key.

---

### **4. Configure environment variables**

Create a `.env` file in the root directory with:

```bash
QDRANT_URL=http://localhost:6333
```

---

### **5. Run the development server**

```bash
pnpm run dev
```

---

### **6. Open the app in your browser**

```
http://localhost:3000
```

---

## **Contributing**

This is an open-source learning project. If you’d like to improve it:

* Fork the repo
* Create a feature branch
* Submit a pull request