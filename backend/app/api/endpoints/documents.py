import os
import shutil
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.config import settings
from app.api.deps import get_current_user
from app.core.document_parser import pdf_processor
from app.db.chromadb_client import vector_db

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    """
    Uploads a PDF, extracts its text, generates embeddings, 
    and registers chunks into ChromaDB under the authenticated user.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF files are accepted."
        )

    # Prepare user-specific directory
    user_upload_dir = os.path.join(settings.UPLOADS_DIR, user_id)
    os.makedirs(user_upload_dir, exist_ok=True)

    # Temporary ID used to name the file safely on disk
    from uuid import uuid4
    temp_doc_id = str(uuid4())
    file_path = os.path.join(user_upload_dir, f"{temp_doc_id}.pdf")

    # Save incoming stream asynchronously
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file to disk: {str(e)}"
        )

    # Process and vector-store file
    try:
        chunks, metadatas, document_id = pdf_processor.extract_and_chunk(
            file_path=file_path,
            user_id=user_id,
            filename=file.filename
        )

        # Rename file on disk to its permanent document_id to keep clean records
        permanent_path = os.path.join(user_upload_dir, f"{document_id}.pdf")
        os.rename(file_path, permanent_path)

        # Push elements to Vector DB
        vector_db.add_documents(chunks=chunks, metadatas=metadatas)

        return {
            "document_id": document_id,
            "filename": file.filename,
            "chunks_count": len(chunks),
            "status": "ingested_successfully"
        }

    except Exception as e:
        # Cleanup temporary file if extraction failed
        if os.path.exists(file_path):
            os.remove(file_path)
        
        status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        if isinstance(e, FileNotFoundError):
            status_code = status.HTTP_404_NOT_FOUND
        
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )

@router.get("", response_model=List[Dict[str, Any]])
async def list_documents(user_id: str = Depends(get_current_user)):
    """
    Deduplicates and lists all uniquely ingested documents 
    directly from ChromaDB metadata to bypass the need for an SQL database.
    """
    try:
        # Retrieve all records associated with the user
        results = vector_db.collection.get(
            where={"user_id": user_id},
            include=["metadatas"]
        )

        unique_docs = {}
        metadatas = results.get("metadatas") or []

        for meta in metadatas:
            doc_id = meta.get("document_id")
            if doc_id and doc_id not in unique_docs:
                unique_docs[doc_id] = {
                    "document_id": doc_id,
                    "filename": meta.get("filename"),
                    "upload_time": meta.get("upload_time")
                }

        # Return list sorted by newest uploaded documents
        return sorted(
            list(unique_docs.values()), 
            key=lambda x: x["upload_time"], 
            reverse=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query document library: {str(e)}"
        )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Deletes a document's vector chunks and clears the saved local PDF file.
    """
    # 1. Cleanse ChromaDB collections
    try:
        vector_db.delete_by_document_id(doc_id=document_id, user_id=user_id)
    except Exception as e:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear vector entries: {str(e)}"
        )

    # 2. Safely remove physical PDF asset from disk
    file_path = os.path.join(settings.UPLOADS_DIR, user_id, f"{document_id}.pdf")
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            # We log the warning but don't fail the API call completely, 
            # as the vectors are already successfully purged.
            print(f"Warning: Failed to delete physical file {file_path}: {e}")

    return None