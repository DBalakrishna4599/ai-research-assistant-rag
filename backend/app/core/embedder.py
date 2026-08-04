import torch
from typing import List
from sentence_transformers import SentenceTransformer
from app.config import settings

class LocalEmbedder:
    def __init__(self):
        # Choose hardware acceleration if available
        if torch.cuda.is_available():
            self.device = "cuda"
        elif torch.backends.mps.is_available():
            self.device = "mps"
        else:
            self.device = "cpu"
            
        print(f"Initializing SentenceTransformer with device: {self.device}")
        
        # Load local model (will download and cache on first run)
        self.model = SentenceTransformer(
            settings.EMBEDDING_MODEL_NAME, 
            device=self.device
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a list of document chunks."""
        if not texts:
            return []
        # BGE models require no special prefix for document chunking
        embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_query(self, query: str) -> List[float]:
        """Generates embedding for a single user query."""
        # BGE-small-en-v1.5 recommends using a query instruction prefix for optimal retrieval
        instruction = "Represent this sentence for searching relevant passages: "
        formatted_query = f"{instruction}{query}"
        embedding = self.model.encode(formatted_query, show_progress_bar=False, convert_to_numpy=True)
        return embedding.tolist()

# Singleton Instance
embedder = LocalEmbedder()