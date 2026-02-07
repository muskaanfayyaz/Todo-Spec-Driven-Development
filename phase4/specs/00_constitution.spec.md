# Phase IV Constitution

## Goal
The primary objective of Phase IV is to successfully deploy the existing Todo Chatbot application from Phase III onto a local Kubernetes cluster. This deployment will leverage Minikube for local environment simulation, Docker for containerization of services, and Helm for package management and deployment orchestration.

## Constraints

### 1. No `kubectl-ai` Usage
The use of `kubectl-ai` or any similar AI-driven kubectl extensions is strictly prohibited. All Kubernetes manifest generation, modification, and interaction must be explicit and verifiable.

### 2. No `kagent` Usage
The `kagent` tool or any equivalent automated Kubernetes agent is not to be used. The deployment process should be transparent and controlled through standard tools (Docker, Helm, Minikube, kubectl).

### 3. AI DevOps Agent
Gemini CLI and Claude Code are designated as the AI DevOps agents for this phase. Gemini CLI will act as the orchestrator, delegating tasks to Claude Code for code generation and analysis as needed. All actions must be performed through these agents.

### 4. No Manual Code Edits
All changes, including infrastructure configurations, Dockerfiles, and Helm charts, must be generated or modified programmatically by the designated AI agents. Direct manual editing of files is disallowed.

### 5. Local Image Builds for Minikube
All Docker images required for the deployment must be built locally within the Minikube environment. No pre-built images from public or private registries will be used unless explicitly approved for base images (e.g., official Python or Node.js images). This ensures full control over the image content and build process.