import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Application Config
    PORT: int = Field(default=8000, alias="PORT")
    HOST: str = Field(default="0.0.0.0", alias="HOST")
    ENV: str = Field(default="development", alias="ENV")
    
    # CORS Configurations
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173", 
        alias="ALLOWED_ORIGINS"
    )
    
    # Clerk Auth Config
    CLERK_API_URL: str = Field(
        default="https://api.clerk.com/v1", 
        alias="CLERK_API_URL"
    )
    CLERK_JWKS_URL: str = Field(..., alias="CLERK_JWKS_URL")
    
    # Storage Config
    CHROMA_DB_DIR: str = Field(default="./data/chromadb", alias="CHROMA_DB_DIR")
    UPLOADS_DIR: str = Field(default="./data/uploads", alias="UPLOADS_DIR")
    
    # Ollama & Model Configuration
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    EMBEDDING_MODEL_NAME: str = Field(default="BAAI/bge-small-en-v1.5", alias="EMBEDDING_MODEL_NAME")
    LLM_MODEL_NAME: str = Field(default="qwen2.5:7b", alias="LLM_MODEL_NAME")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings singleton
try:
    settings = Settings()
except Exception as e:
    # Fallback to local testing configurations if validation fails
    print(f"Configuration validation warning: {e}. Checking environment defaults...")
    # Raise configuration errors early to avoid running system in misconfigured states
    raise e