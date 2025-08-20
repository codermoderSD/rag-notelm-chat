# NoteLM
This project is a clone of NotebookLM, an AI powered app to help users manage and interact with their documents more effectively. It leverages RAG (Retrieval-Augmented Generation) to provide context-aware responses and improve user experience.

## Features
- Document Upload: Users can upload pdf, text and website url for analysis.
- Contextual Responses: The app provides answers based on the content of the uploaded documents.
- User-Friendly Interface: The chat interface is designed for easy interaction.

# Future Enhancements
- Multi-Language Support: Expand the app's capabilities to support multiple languages.
- Advanced Document Analysis: Implement more sophisticated algorithms for document analysis and summarization.
- User Customization: Allow users to customize the chat interface and experience.

## Setup

To set up the project locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/codermoderSD/rag-notelm-chat
```

2. Navigate to the project directory:

```bash
cd rag-notelm-chat
```

3. Install the dependencies:

```bash
pnpm install
```

4. Configure Quadrant DB Environment Variables:

Create a `.env` file in the root of the project and add your Quadrant DB credentials:

```bash
QDRANT_URL=your_db_url:port
QUADRANT_API_KEY=your_db_key
```

Make sure to replace `your_db_url` and `your_db_key` with your actual Quadrant DB credentials.

5. Start the development server:

```bash
pnpm run dev
```

6. Open your browser and go to `http://localhost:3000` to see the app in action.