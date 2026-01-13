# Todo App - Phase II Backend

FastAPI backend with Clean Architecture, PostgreSQL, and JWT authentication.

## Structure

```
backend/
├── app/
│   ├── domain/          # Business entities and value objects (Phase I - UNCHANGED)
│   ├── application/     # Use cases and business logic (Phase I - UNCHANGED)
│   ├── infrastructure/  # Database repositories and external services (NEW)
│   ├── presentation/    # FastAPI REST API endpoints (NEW)
│   ├── main.py         # Application entry point
│   ├── config.py       # Configuration management
│   ├── database.py     # Database connection
│   └── auth.py         # JWT verification
└── tests/              # Test suite
```

## Setup

1. Create virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -e .
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run development server:
   ```bash
   python -m app.main
   # or
   uvicorn app.main:app --reload
   ```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Health Check

```bash
curl http://localhost:8000/health
```

## Architecture

This backend follows **Clean Architecture** principles:

1. **Domain Layer** (innermost): Pure business logic, no dependencies
2. **Application Layer**: Use cases orchestrating domain entities
3. **Infrastructure Layer**: Database, external services
4. **Presentation Layer**: HTTP endpoints, request/response handling

**Dependency Rule**: Outer layers depend on inner layers, NEVER the reverse.
