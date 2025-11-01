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

#  utility functions 

def upsert_in_batches(qdrant_client, collection_name, points, batch_size=50, retries=3):
    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        structured_points = [
            PointStruct(id=p["id"], vector=p["vector"], payload=p["payload"])
            for p in batch
        ]
        for attempt in range(retries):
            try:
                qdrant_client.upsert(collection_name=collection_name, points=structured_points)
                break
            except Exception as e:
                print(f"Batch {i // batch_size + 1} failed (attempt {attempt + 1}): {e}")
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
        print(f"ChatGroq summarization failed: {e}")
        return text[:300]


#  initialization 

SENTENCE_MODEL = SentenceTransformer("all-MiniLM-L6-v2")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "html_chunks"

qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=60)

#  main API View 

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

        # fetch HTML
        try:
            resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()
            html = resp.text
        except Exception as e:
            return Response(
                {"detail": f"Failed to fetch the URL: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # parse and clean HTML
        soup = BeautifulSoup(html, "html.parser")
        for s in soup(["script", "style", "noscript", "header", "footer", "svg"]):
            s.decompose()

        text = "\n".join(
            [line.strip() for line in soup.get_text(separator="\n").splitlines() if line.strip()]
        )

        #  tokenize and chunk
        words = word_tokenize(text)
        max_tokens = 1000
        chunks = []
        for i in range(0, len(words), max_tokens):
            chunk_text = " ".join(words[i:i + max_tokens])
            if not chunk_text.strip():
                continue
            # try to extract the most readable section of the page
            candidates = []

            # priority tags that usually hold main content
            for selector in [
                "main",
                "article",
                "section",
                "div#main-content",
                "div#content",
                "div#primary",
                "div[class*='article']",
                "div[class*='content']",
                "div[class*='post']",
                "div[class*='entry']",
                "div[class*='page']",
                "div[class*='text']",
                "div[class*='read']",
                "div[class*='container']",
            ]:
                tag = soup.select_one(selector)
                if tag and len(tag.get_text(strip=True)) > 200:
                    candidates.append(tag)

            # if nothing found, fallback to the largest text block
            if not candidates:
                all_divs = soup.find_all(["div", "section", "article"])
                largest = max(all_divs, key=lambda d: len(d.get_text(strip=True)), default=None)
                if largest and len(largest.get_text(strip=True)) > 200:
                    candidates.append(largest)

            # choose the most text-heavy section
            main_content = max(
                candidates, key=lambda el: len(el.get_text(strip=True)), default=soup.body
            )

            #  clean up unwanted elements 
            for junk in main_content.find_all(
                ["nav", "aside", "footer", "form", "button", "svg", "script", "style", "noscript", "header", "iframe", "input"]
            ):
                junk.decompose()


            # extract prettified readable subset
            html_text = str(main_content) if main_content else soup.prettify()

            # Truncate 
            if len(html_text) > 2000:
                html_pretty_safe = html_text[:2000] + "\n<!-- [truncated for performance] -->"
            else:
                html_pretty_safe = html_text



            chunks.append({
                "text": chunk_text,
                "html_pretty": html_pretty_safe
            })

        if not chunks:
            return Response({"detail": "No textual content found."}, status=400)

        #  dynamic per domain collection
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
                print(f"Created collection: {collection_name}")

            try:
                qdrant.create_payload_index(
                    collection_name=collection_name,
                    field_name="url",
                    field_schema="keyword",
                )
                print(f"Created index for 'url' in {collection_name}")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    print(f"Could not create index for 'url': {e}")

        ensure_collection(COLLECTION_NAME)

        # delete any previously stored chunks for this URL
        try:
            qdrant.delete(
                collection_name=COLLECTION_NAME,
                points_selector={
                    "filter": {
                        "must": [{"key": "url", "match": {"value": url}}]
                    }
                },
            )
            print(f"Deleted old chunks for URL: {url}")
        except Exception as e:
            print(f"Warning: could not delete old chunks for {url}: {e}")

        # embed and store new content 
        points = []
        for idx, chunk in enumerate(chunks):
            vector = SENTENCE_MODEL.encode(chunk["text"]).tolist()
            html_pretty_full = chunk["html_pretty"]

            # extract main readable HTML
            soup = BeautifulSoup(html_pretty_full, "html.parser")
            for tag in soup(["script", "style", "noscript", "iframe", "svg", "header", "footer"]):
                tag.decompose()
            readable_html = soup.prettify()

            # limit size 
            MAX_LEN = 2000
            if len(readable_html) > MAX_LEN:
                readable_html_safe = readable_html[:MAX_LEN] + "\n<!-- [truncated for performance] -->"
            else:
                readable_html_safe = readable_html

            html_pretty_safe = f"""
                <details style='margin-top:8px;'>
                    <summary style='cursor:pointer;color:#2563eb;font-weight:600;'>View HTML (readable preview)</summary>
                    <div style='border:1px solid #ddd;padding:10px;margin-top:5px;border-radius:8px;'>
                        {readable_html_safe}
                    </div>
                </details>
                """


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

        # semantic search
        query_vec = SENTENCE_MODEL.encode(query).tolist()
        search_result = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vec,
            limit=10,
            query_filter={
                "must": [{"key": "url", "match": {"value": url}}]
            },
        )

        # prepare structured response
        results = []
        for item in search_result:
            payload = item.payload or {}
            raw_text = payload.get("text", "")
            html_pretty = payload.get("html_pretty", "(no html stored)")
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
            print(f"Chunk #{r['chunk_index']} | {r['accuracy']}% | Summary:\n{r['summary']}\n")

        return Response({"results": results})
