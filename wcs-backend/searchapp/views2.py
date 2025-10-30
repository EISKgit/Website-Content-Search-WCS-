import os
from bs4 import BeautifulSoup
from html import escape
import requests
import hashlib
from nltk.tokenize import word_tokenize
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from dotenv import load_dotenv
import time
import uuid
from urllib.parse import urlparse

load_dotenv()


#_________ Utility Functions__________________________________________


def upsert_in_batches(qdrant_client, collection_name, points, batch_size=50, retries=3):
    for i in range(0, len(points), batch_size):
        batch = points[i:i+batch_size]
        structured_points = [
            PointStruct(id=p["id"], vector=p["vector"], payload=p["payload"])
            for p in batch
        ]
        for attempt in range(retries):
            try:
                qdrant_client.upsert(collection_name=collection_name, points=structured_points)
                break
            except Exception as e:
                print(f" Batch {i//batch_size+1} failed (attempt {attempt+1}): {e}")
                if attempt == retries - 1:
                    raise e
                time.sleep(2)


def summarize_with_chatgroq(text):
    """Generate a 3–4 line summary using ChatGroq API."""
    try:
        response = requests.post(
            "https://api.chatgroq.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('CHATGROQ_API_KEY')}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "Summarize the following webpage content in 3–4 lines. Be concise and informative.",
                    },
                    {"role": "user", "content": text},
                ],
            },
            timeout=30,
        )
        data = response.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", text[:300])
    except Exception as e:
        print(f" ChatGroq summarization failed: {e}")
        return text[:300]

#_______________________________________________________________________________________________



# __________Initialization_____________________________________________________________________

SENTENCE_MODEL = SentenceTransformer("all-MiniLM-L6-v2")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "html_chunks"

qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=60)


def ensure_collection():
    """Create collection if it doesn't exist."""
    collections = [c.name for c in qdrant.get_collections().collections]
    if COLLECTION_NAME not in collections:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

#___________________________________________________________________________________________________



#______ Main API View_______________________________________________________________________________

class SearchAPIView(APIView):
    def post(self, request):
        print("Received data:", request.data)

        url = request.data.get("url")
        query = request.data.get("query")

        if not url or not query:
            return Response(
                {"detail": "Both 'url' and 'query' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1 Fetch HTML
        try:
            resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()
            html = resp.text
        except Exception as e:
            return Response(
                {"detail": f"Failed to fetch the URL: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2 Parse and clean HTML
        soup = BeautifulSoup(html, "html.parser")
        for s in soup(["script", "style", "noscript", "header", "footer", "svg"]):
            s.decompose()

        text = "\n".join(
            [line.strip() for line in soup.get_text(separator="\n").splitlines() if line.strip()]
        )

        # 3 Tokenize and chunk
        words = word_tokenize(text)
        max_tokens = 500
        chunks = []
        for i in range(0, len(words), max_tokens):
            chunk_text = " ".join(words[i:i + max_tokens])
            if not chunk_text.strip():
                continue

            # Each chunk stores the full formatted DOM (later truncated for performance)
            chunk_html = soup.prettify()

            chunks.append({
                "text": chunk_text,
                "html_pretty": chunk_html
            })

        if not chunks:
            return Response({"detail": "No textual content found."}, status=400)

        # 4 Dynamic per-domain collection
        domain = urlparse(url).netloc.replace(".", "_")
        COLLECTION_NAME = f"html_chunks_{domain}"

        def ensure_collection(collection_name):
            """Create collection if it doesn't exist and ensure URL index exists."""
            collections = [c.name for c in qdrant.get_collections().collections]
            if collection_name not in collections:
                qdrant.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
                )
                print(f" Created collection: {collection_name}")

            #  Ensure URL index exists
            try:
                qdrant.create_payload_index(
                    collection_name=collection_name,
                    field_name="url",
                    field_schema="keyword",
                )
                print(f" Created index for 'url' in {collection_name}")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    print(f" Could not create index for 'url': {e}")


        ensure_collection(COLLECTION_NAME)

        #  Delete any previously stored chunks for this URL
        try:
            qdrant.delete(
                collection_name=COLLECTION_NAME,
                points_selector={
                    "filter": {
                        "must": [{"key": "url", "match": {"value": url}}]
                    }
                },
            )
            print(f"🧹 Deleted old chunks for URL: {url}")
        except Exception as e:
            print(f" Warning: could not delete old chunks for {url}: {e}")

        # 5 Embed and store new content
        points = []
        for idx, chunk in enumerate(chunks):
            vector = SENTENCE_MODEL.encode(chunk["text"]).tolist()
            html_pretty_full = chunk["html_pretty"]

            # Limit HTML size for performance
            if len(html_pretty_full) > 2000:
                html_pretty_safe = html_pretty_full[:2000] + "\n<!-- [truncated for performance] -->"
            else:
                html_pretty_safe = html_pretty_full

            points.append({
                "id": str(uuid.uuid4()),
                "vector": vector,
                "payload": {
                    "url": url,
                    "chunk_index": idx,
                    "text": chunk["text"],
                    "html_pretty": html_pretty_safe,
                },
            })

        upsert_in_batches(qdrant, COLLECTION_NAME, points)

        # 6 Semantic search
        query_vec = SENTENCE_MODEL.encode(query).tolist()
        search_result = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vec,
            limit=10,
            query_filter={
                "must": [{"key": "url", "match": {"value": url}}],
            },
        )

        # 7 Prepare structured response
        results = []
        for item in search_result:
            payload = item.payload or {}
            raw_text = payload.get("text", "")
            html_pretty_full = payload.get("html_pretty", "(no html stored)")

            html_pretty = (
                html_pretty_full[:2000] + "\n<!-- [truncated for performance] -->"
                if len(html_pretty_full) > 2000
                else html_pretty_full
            )

            score = getattr(item, "score", 0.0) or 0.0
            clean_text = BeautifulSoup(raw_text, "html.parser").get_text()
            summary = summarize_with_chatgroq(clean_text)

            results.append({
                "id": item.id,
                "summary": summary,
                "score": round(score, 6),
                "accuracy": round(score * 100, 2),
                "html_pretty": html_pretty,
                "text": clean_text,
                "chunk_index": payload.get("chunk_index"),
                "url": payload.get("url"),
            })

        for r in results:
            print(f" Chunk #{r['chunk_index']} | {r['accuracy']}% | Summary:\n{r['summary']}\n")

        return Response({"results": results})
#________________________________________________________________________________________________