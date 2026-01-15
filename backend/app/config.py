"""
Application Configuration
Loads environment variables and provides configuration settings
"""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


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

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://todo-spec-driven-development-fronte.vercel.app",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
