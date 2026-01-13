"""
FastAPI Application Entry Point
Main application factory and configuration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import create_db_and_tables
from app.presentation.routers import user, tasks


settings = get_settings()


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.

    Returns:
        FastAPI: Configured application instance
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Multi-user task management API with JWT authentication",
        debug=settings.debug,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(user.router)
    app.include_router(tasks.router)

    # Event handlers
    @app.on_event("startup")
    async def startup_event():
        """Initialize database on startup."""
        create_db_and_tables()

    # Root endpoint (public)
    @app.get("/")
    async def root():
        """Root endpoint - API information."""
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "status": "running",
            "endpoints": {
                "health": "/health",
                "docs": "/docs",
                "api": "/api/{user_id}/tasks"
            },
            "message": "Todo API is running! Visit /docs for interactive API documentation."
        }

    # Health check endpoint (public)
    @app.get("/health")
    async def health_check():
        """API health check endpoint (no authentication required)."""
        return {
            "status": "healthy",
            "version": settings.app_version,
        }

    return app


# Create application instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
