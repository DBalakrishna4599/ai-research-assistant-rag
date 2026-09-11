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
from app.core.embedder import embedder  # Import our local embedder safely

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    document_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]

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
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"Warning: Failed to persist chat history: {e}")

@router.post("", response_model=ChatResponse)
async def generate_rag_answer(
    payload: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Executes similarity search on the VM, prompts local Qwen 2.5,
    and returns contextualized answer.
    """
    chunks = []
    sources = []

    # 1. Retrieve Context from ChromaDB
    try:
        query_text = payload.message
        
        # Generate embedding vector using our SentenceTransformer
        query_vector = embedder.embed_query(query_text)
        
        # Build strict dynamic metadata filter
        where_filter = {"user_id": user_id}
        if payload.document_id:
            where_filter = {
                "$and": [
                    {"user_id": user_id},
                    {"document_id": payload.document_id}
                ]
            }

        # Query ChromaDB using the pre-computed embedding vector
        query_results = vector_db.collection.query(
            query_embeddings=[query_vector],
            n_results=5,
            where=where_filter
        )

        if query_results and query_results.get("documents") and query_results["documents"][0]:
            docs = query_results["documents"][0]
            metas = query_results["metadatas"][0]
            for idx, doc in enumerate(docs):
                chunks.append(doc)
                sources.append({
                    "text": doc,
                    "filename": metas[idx].get("filename"),
                    "page_number": metas[idx].get("page_number")
                })
                
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing vector similarity search: {str(e)}"
        )

    # 2. Build strict prompt context
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
        async with httpx.AsyncClient(timeout=240.0) as client:
            ollama_url = f"{settings.OLLAMA_BASE_URL}/api/generate"
            response = await client.post(
                ollama_url,
                json={
                    "model": settings.LLM_MODEL_NAME,
                    "prompt": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.0,  # Factual precision
                        "num_ctx": 2048,
                        "num_predict": 300
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
    return read_chat_history(user_id)
