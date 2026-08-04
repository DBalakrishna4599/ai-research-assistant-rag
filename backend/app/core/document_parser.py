import os
import time
import uuid
import fitz  # PyMuPDF
from typing import List, Dict, Any, Tuple
from langchain_text_splitters import RecursiveCharacterTextSplitter

class PDFProcessor:
    def __init__(self, chunk_size: int = 600, chunk_overlap: int = 100):
        """
        Initializes the document chunker.
        
        Args:
            chunk_size: Target size of each text block in characters.
            chunk_overlap: Overlap length between neighboring chunks.
        """
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    def extract_and_chunk(
        self, 
        file_path: str, 
        user_id: str, 
        filename: str
    ) -> Tuple[List[str], List[Dict[str, Any]], str]:
        """
        Parses a PDF file, extracts text, generates metadata-paired chunks, and returns them.
        
        Args:
            file_path: Path to the PDF file saved on disk.
            user_id: Owner of the file.
            filename: Original uploaded file name.
            
        Returns:
            Tuple containing:
              - List[str]: Text chunks
              - List[Dict[str, Any]]: Metadata for each chunk
              - str: Unique document ID
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Source file not found at {file_path}")

        document_id = str(uuid.uuid4())
        upload_time = int(time.time())
        
        chunks_list: List[str] = []
        metadatas_list: List[Dict[str, Any]] = []

        try:
            # Open PDF using PyMuPDF
            with fitz.open(file_path) as doc:
                for page_idx, page in enumerate(doc):
                    page_num = page_idx + 1
                    text = page.get_text() or ""
                    
                    # Clean whitespace and strip unreadable control characters
                    cleaned_text = " ".join(text.strip().split())
                    if not cleaned_text:
                        continue
                    
                    # Split page text into smaller blocks
                    page_chunks = self.splitter.split_text(cleaned_text)
                    
                    for chunk in page_chunks:
                        chunks_list.append(chunk)
                        metadatas_list.append({
                            "user_id": user_id,
                            "document_id": document_id,
                            "filename": filename,
                            "page_number": page_num,
                            "upload_time": upload_time
                        })

            # Check if text was successfully extracted (e.g., handles scanned PDFs or images)
            if not chunks_list:
                raise ValueError(
                    "No text could be extracted from this PDF. "
                    "The file might be corrupted, password-protected, or comprised entirely of images."
                )

            return chunks_list, metadatas_list, document_id

        except Exception as e:
            # Propagate clean exceptions to API controller
            if isinstance(e, ValueError):
                raise e
            raise RuntimeError(f"Failed to process PDF document: {str(e)}")

# Singleton Instance
pdf_processor = PDFProcessor()