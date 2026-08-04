from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.auth import clerk_verifier

# Reusable security scheme
security_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> str:
    """
    FastAPI dependency that extracts and validates the User ID from the Authorization header.
    Returns:
        str: Verified Clerk user_id (e.g., 'user_2b8...').
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is missing or malformed."
        )
    
    token = credentials.credentials
    # Validate the token and return parsed payload
    payload = clerk_verifier.verify_token(token)
    
    # Clerk subject claim contains the authenticated user identifier
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing the user subject claim."
        )
        
    return user_id