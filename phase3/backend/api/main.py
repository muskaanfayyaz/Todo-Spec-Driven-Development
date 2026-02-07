# T-343: Phase III Application Entry Point
# Spec: chat-api.spec.md Section 7
#
# Imports Phase II FastAPI app and mounts Phase III chat router.
# Does NOT duplicate app - extends existing app with new routes.
#
# Usage:
#   uvicorn phase-3.backend.api.main:app --reload
#   or
#   python -m phase-3.backend.api.main

import sys
import logging
from pathlib import Path

# Add phase2 to path BEFORE importing
_phase2_path = Path(__file__).parent.parent.parent.parent / "phase2" / "backend"
if str(_phase2_path) not in sys.path:
    sys.path.insert(0, str(_phase2_path))

# Add phase3 backend to path for absolute imports (e.g., "from agent import ...")
_phase3_backend_path = Path(__file__).parent.parent
if str(_phase3_backend_path) not in sys.path:
    sys.path.insert(0, str(_phase3_backend_path))

# Phase II app import (existing FastAPI application)
from app.main import app

# Phase III router import
from .router import chat_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Mount Phase III chat router onto Phase II app
# Spec Section 7.2: Register Phase III routes onto Phase II app
# Route: POST /api/{user_id}/chat
app.include_router(chat_router, prefix="/api", tags=["chat"])

logger.info("Phase III chat router mounted at /api/{user_id}/chat")


# Re-export app for uvicorn
__all__ = ["app"]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "phase-3.backend.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )