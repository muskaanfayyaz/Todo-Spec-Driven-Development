# Dockerfile for the Phase III Backend (FastAPI)
# This Dockerfile creates a production-ready image for the backend service.
# It leverages a multi-stage build to keep the final image size small.

# --- Build Stage ---
# This stage installs dependencies.
FROM python:3.10-slim-bullseye AS builder

# Set the working directory
WORKDIR /app

# Set PYTHONPATH to include both phase2 and phase3 code, mimicking the logic in main.py
ENV PYTHONPATH="/app/phase2/backend:/app/phase3/backend"

# Copy the requirements file from phase2
COPY phase2/backend/requirements.txt /app/phase2/backend/requirements.txt

# Install Python dependencies
# Using a virtual environment is a good practice
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r /app/phase2/backend/requirements.txt

# Copy application code from phase2 and phase3
# This assumes phase3 code might overlay or extend phase2 code.
COPY phase2/backend /app/phase2/backend
COPY phase3/backend /app/phase3/backend


# --- Production Stage ---
# This stage creates the final, lean production image.
FROM python:3.10-slim-bullseye AS production

# Set the working directory
WORKDIR /app

# Set PYTHONPATH
ENV PYTHONPATH="/app/phase2/backend:/app/phase3/backend"

# Copy the virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy the application code
COPY --from=builder /app /app

# Make sure the PATH is set correctly
ENV PATH="/opt/venv/bin:$PATH"

# Expose the port the app runs on
EXPOSE 8000

# The command to run the application
# It refers to the main:app object in phase3/backend/api/main.py
CMD ["uvicorn", "phase3.backend.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
