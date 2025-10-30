
# Website Content Search (React + Django + Qdrant)

## Objective
A single-page application that accepts a website URL and a search query, then returns the top 10 HTML DOM content chunks (≤500 tokens) most relevant to the query.

## Tech Stack
- **Frontend:** React + Vite + Tailwind + framer-motion  
- **Backend:** Django + Django REST Framework  
- **Vector Database:** Qdrant Cloud  
- **Embeddings:** `sentence-transformers` (`all-MiniLM-L6-v2`)  
- **Tokenization:** `nltk`  
- **HTML Parsing:** `beautifulsoup4`  
- **Optional LLM:** Groq (ChatGroq `llama-3.3-70b-versatile`) for reranking and summaries  


## Quickstart (Backend)

1. **Create virtual environment and install dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
    ````

2. **Download NLTK data:**

   ```bash
   python -c "import nltk; nltk.download('punkt')"
   ```

3. **Set environment variables:**

   ```bash
   export QDRANT_URL="https://<your-cluster-url>:6333"
   export QDRANT_API_KEY="<your-qdrant-api-key>"
   export GROQ_API_KEY="<your-groq-api-key>"  
   export DJANGO_SECRET_KEY="xxx"
   ```

4. **Run Django:**

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

---

## Quickstart (Frontend)

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Create a `.env` file:**

   ```bash
   VITE_API_BASE=http://localhost:8000
   ```

3. **Install dependencies and start the development server:**

   ```bash
   npm install
   npm run dev
   ```

---

## How It Works (High-Level)

1. The backend:

   * Fetches HTML from the provided URL.
   * Removes scripts and styles.
   * Tokenizes the text into ≤500-token chunks using `nltk`.
   * Encodes the chunks using `sentence-transformers`.
   * Upserts the embeddings into a Qdrant collection.

2. For a search query:

   * The query is encoded into a vector.
   * Qdrant performs a similarity search to retrieve the top 10 most relevant chunks.
   * The backend returns the chunk text, metadata, and similarity scores.

---

## Qdrant Cloud Setup

1. Create a cluster on [Qdrant Cloud](https://qdrant.tech/cloud/).
2. Generate a Database API key.
3. Add the cluster URL and API key to your environment variables.
4. Refer to the official Qdrant Cloud documentation for more details.

```
```
