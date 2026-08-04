import os
import uuid
import chromadb
from typing import List, Dict, Any, Optional
from app.config import settings
from app.core.embedder import embedder

class VectorDBManager:
    def __init__(self):
        # Ensure the persistent directory exists
        os.makedirs(settings.CHROMA_DB_DIR, exist_ok=True)
        
        # Initialize Persistent Client
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
        
        # Default RAG Collection name
        self.collection_name = "research_assistant_rag"
        self._get_or_create_collection()

    def _get_or_create_collection(self):
        """Retrieves or creates the vector collection with cosine similarity configuration."""
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"} # Cosine distance is standard for BGE models
        )

    def add_documents(
        self, 
        chunks: List[str], 
        metadatas: List[Dict[str, Any]], 
        ids: Optional[List[str]] = None
    ) -> List[str]:
        """
        Generates embeddings and inserts chunks into the database.
        
        Args:
            chunks: List of extracted text strings.
            metadatas: List of dictionaries matching chunks, containing metadata (user_id, filename, etc.).
            ids: Optional list of unique IDs. If not supplied, UUIDs will be generated.
        """
        if not chunks:
            return []

        # Generate unique IDs if none provided
        if not ids:
            ids = [str(uuid.uuid4()) for _ in range(len(chunks))]

        # Generate embeddings locally
        embeddings = embedder.embed_documents(chunks)

        # Store in ChromaDB
        self.collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        return ids

    def search_similar_chunks(
        self, 
        query: str, 
        user_id: str, 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Performs semantic similarity search over stored chunks.
        
        Filters results dynamically using 'where' clauses to ensure users can only 
        access their own files.
        """
        query_embedding = embedder.embed_query(query)
        
        # Query matching embeddings with a strict user metadata filter
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"user_id": user_id}
        )

        formatted_results = []
        if not results or not results["documents"]:
            return formatted_results

        # Parse Chroma DB query return structures
        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0] if "distances" in results else [0.0] * len(documents)
        ids = results["ids"][0]

        for i in range(len(documents)):
            formatted_results.append({
                "id": ids[i],
                "text": documents[i],
                "metadata": metadatas[i],
                "distance": distances[i]
            })

        return formatted_results

    def delete_by_document_id(self, doc_id: str, user_id: str):
        """Removes all vector chunks belonging to a specific document and user."""
        self.collection.delete(
            where={
                "$and": [
                    {"document_id": doc_id},
                    {"user_id": user_id}
                ]
            }
        )

    def delete_all_user_data(self, user_id: str):
        """Removes all stored vectors associated with a user."""
        self.collection.delete(
            where={"user_id": user_id}
        )

# Singleton Instance
vector_db = VectorDBManager()