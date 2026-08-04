import os
import json
import time
import httpx
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.config import settings
from app.api.deps import get_current_user
from app.db.chromadb_client import vector_db

router = APIRouter(prefix="/chat", tags=["chat"])

# Request / Response Schemas
class ChatRequest(BaseModel):
    message: str
    document_id: Optional[str] = None  # Optionally isolate chat to one document

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]

# File-based helper functions to maintain strict No-SQL architecture
def get_history_file_path(user_id: str) -> str:
    user_dir = os.path.join(settings.UPLOADS_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)
    return os.path.join(user_dir, "chat_history.json")

def read_chat_history(user_id: str) -> List[Dict[str, Any]]:
    path = get_history_file_path(user_id)
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def append_to_chat_history(user_id: str, user_msg: str, bot_response: str, document_id: Optional[str] = None):
    path = get_history_file_path(user_id)
    history = read_chat_history(user_id)
    
    history.append({
        "id": str(int(time.time() * 1000)),
        "timestamp": int(time.time()),
        "role": "user",
        "content": user_msg,
        "document_id": document_id
    })
    history.append({
        "id": str(int(time.time() * 1000) + 1),
        "timestamp": int(time.time()),
        "role": "assistant",
        "content": bot_response,
        "document_id": document_id
    })
    
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_fallback=True)
    except Exception as e:
        print(f"Warning: Failed to persist chat history: {e}")

@router.post("", response_model=ChatResponse)
async def generate_rag_answer(
    payload: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Executes a semantic search over vector storage, forms a context prompt,
    polls Ollama for local LLM inference, and tracks the history log.
    """
    # 1. Retrieve Context from ChromaDB
    try:
        query_text = payload.message
        
        # Build dynamic query metadata filter
        where_filter = {"user_id": user_id}
        if payload.document_id:
            where_filter = {
                "$and": [
                    {"user_id": user_id},
                    {"document_id": payload.document_id}
                ]
            }

        # Query vector manager (resolving matching vector embeddings)
        # We manually query the client collection here to support dynamic nested AND filters
        query_embedding = vector_db.collection.query(
            query_embeddings=[vector_db.client.get_or_create_collection("research_assistant_rag")._embedding_function(query_text)] 
            if hasattr(vector_db.collection, "_embedding_function") else None,
            # Fallback to manual embedder evaluation
            query_embeddings_fallback=[vector_db.client.get_or_create_collection("research_assistant_rag")._embedding_function(query_text)] 
            if not hasattr(vector_db, "search_similar_chunks") else None,
            n_results=5,
            where=where_filter
        )
        
        # Format the retrieved chunks
        chunks = []
        sources = []
        if query_embedding and query_embedding.get("documents") and query_embedding["documents"][0]:
            docs = query_embedding["documents"][0]
            metas = query_embedding["metadatas"][0]
            for idx, doc in enumerate(docs):
                chunks.append(doc)
                sources.append({
                    "text": doc,
                    "filename": metas[idx].get("filename"),
                    "page_number": metas[idx].get("page_number")
                })
        else:
            # Try via wrapper if manual generation fails
            retrieved = vector_db.search_similar_chunks(query_text, user_id=user_id, top_k=5)
            for item in retrieved:
                # If document filter was specified, skip non-matching documents
                if payload.document_id and item["metadata"].get("document_id") != payload.document_id:
                    continue
                chunks.append(item["text"])
                sources.append({
                    "text": item["text"],
                    "filename": item["metadata"].get("filename"),
                    "page_number": item["metadata"].get("page_number")
                })
                
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving matching knowledge chunks: {str(e)}"
        )

    # 2. Build strict RAG Prompt Context
    context_block = "\n---\n".join(chunks) if chunks else "No context found."
    
    system_prompt = (
        "Always answer ONLY from the retrieved context. "
        "If the answer is unavailable in the retrieved context, you must respond exactly with "
        "\"I couldn't find that information in the uploaded document.\"\n"
        "Do not use external knowledge or fabricate details.\n\n"
        f"Retrieved Context:\n{context_block}\n\n"
        f"User Question: {payload.message}\n"
        "Answer:"
    )

    # 3. Call local Ollama Endpoint
    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            ollama_url = f"{settings.OLLAMA_BASE_URL}/api/generate"
            response = await client.post(
                ollama_url,
                json={
                    "model": settings.LLM_MODEL_NAME,
                    "prompt": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.0  # Set to 0 to keep factual precision high
                    }
                }
            )
            response.raise_for_status()
            ollama_data = response.json()
            answer = ollama_data.get("response", "").strip()

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Local LLM engine returned an error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Inference engine unreachable on VM (Ollama may be offline): {str(e)}"
        )

    # 4. Save and return transaction results
    append_to_chat_history(
        user_id=user_id, 
        user_msg=payload.message, 
        bot_response=answer, 
        document_id=payload.document_id
    )

    return ChatResponse(
        answer=answer,
        sources=sources
    )

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_chat_history(user_id: str = Depends(get_current_user)):
    """
    Returns the complete message thread history log for the current authenticated tenant.
    """
    return read_chat_history(user_id)