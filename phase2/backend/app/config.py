"""
Application Configuration
Loads environment variables and provides configuration settings
"""

import os
import json
from functools import lru_cache
from pydantic_settings import BaseSettings


# Default CORS origins (always included)
DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://todo-spec-driven-development-fronte.vercel.app",
]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Todo App - Phase II"
    app_version: str = "2.0.0"
    debug: bool = False

    # Database
    database_url: str = "postgresql://user:password@localhost/todoapp"

    # Authentication
    better_auth_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 1

    # CORS - Additional origins from environment (optional)
    cors_origins_extra: str = ""

    # Phase III: AI Chatbot (optional, only needed if using chatbot)
    gemini_api_key: str = ""

    @property
    def cors_origins(self) -> list[str]:
        """Get all CORS origins including defaults and extras from env."""
        # Allow all origins if in debug mode for local development (e.g., Minikube)
        if self.debug:
            return ["*"]

        origins = DEFAULT_CORS_ORIGINS.copy()
        if self.cors_origins_extra:
            try:
                extra = json.loads(self.cors_origins_extra)
                if isinstance(extra, list):
                    origins.extend(extra)
            except json.JSONDecodeError:
                # If not JSON, treat as comma-separated
                for origin in self.cors_origins_extra.split(","):
                    origin = origin.strip()
                    if origin:
                        origins.append(origin)
        return list(set(origins))  # Remove duplicates

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra env vars not defined in Settings


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
