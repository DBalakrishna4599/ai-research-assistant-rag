import time
import requests
from typing import Dict, Any, Optional
from jose import jwt, jwk
from jose.utils import base64url_decode
from fastapi import HTTPException, status
from app.config import settings

class ClerkJWTVerifier:
    def __init__(self):
        self.jwks_url = settings.CLERK_JWKS_URL
        self._jwks_cache: Optional[Dict[str, Any]] = None
        self._cache_expiry: float = 0.0
        self._cache_ttl: int = 3600  # Cache keys for 1 hour

    def _fetch_jwks(self) -> Dict[str, Any]:
        """Fetches the JWKS from Clerk's API with basic caching."""
        current_time = time.time()
        if self._jwks_cache and current_time < self._cache_expiry:
            return self._jwks_cache

        try:
            response = requests.get(self.jwks_url, timeout=10)
            response.raise_for_status()
            self._jwks_cache = response.json()
            self._cache_expiry = current_time + self._cache_ttl
            return self._jwks_cache
        except Exception as e:
            # Fallback to expired cache if request fails to maintain system availability
            if self._jwks_cache:
                return self._jwks_cache
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Unable to retrieve public authentication keys: {str(e)}"
            )

    def verify_token(self, token: str) -> Dict[str, Any]:
        """Decodes and validates a Clerk JWT token."""
        try:
            # Unverified claims to fetch kid (Key ID) header
            headers = jwt.get_unverified_header(token)
            kid = headers.get("kid")
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token header: missing kid."
                )

            jwks = self._fetch_jwks()
            
            # Locate the key that matches the token's Key ID
            public_key = None
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    public_key = jwk.construct(key)
                    break

            if not public_key:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication key not recognized."
                )

            # Extract the message and signature portions of the token
            message, encoded_sig = token.rsplit(".", 1)
            decoded_sig = base64url_decode(encoded_sig.encode("utf-8"))

            # Verify signature using public key
            if not public_key.verify(message.encode("utf-8"), decoded_sig):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token verification failed: invalid signature."
                )

            # Decode claims now that the signature is authenticated
            # We bypass PyJWT's internal verification because we verified signature above
            claims = jwt.get_unverified_claims(token)

            # Verify expiration
            current_time = time.time()
            if claims.get("exp", 0) < current_time:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired."
                )

            return claims

        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token validation failed: {str(e)}"
            )

# Singleton Instance
clerk_verifier = ClerkJWTVerifier()