# Phase 4 Infrastructure Specification

## 1. Overview

This document specifies the complete infrastructure plan for Phase 4: deploying the full-stack AI Todo application to a local Kubernetes (Minikube) cluster. This phase focuses exclusively on packaging and orchestrating the existing application using cloud-native tools and practices.

## 2. Service & Communication Architecture

### 2.1. Phase 2: The Full-Stack Todo App

-   **Role:** Provides the core, foundational full-stack application.
-   **Backend:** A FastAPI service responsible for user authentication, task CRUD operations, and database interactions.
-   **Frontend:** A Next.js web application providing the user interface for managing tasks.

### 2.2. Phase 3: The AI Chatbot Service

-   **Role:** An AI-powered chatbot layer that extends the Phase 2 backend.
-   **Backend:** A FastAPI service that contains the AI agent logic, tool definitions, and the `/chat` API endpoint.

### 2.3. Backend Communication Strategy

A critical architectural detail is that the Phase 3 backend **runs in the same process** as the Phase 2 backend. The Phase 3 FastAPI application (`phase3/backend/api/main.py`) programmatically imports and mounts the Phase 2 FastAPI application.

-   **Conclusion:** There is only **one backend service process** to containerize and deploy. This unified service exposes both the core Task APIs from Phase 2 and the `/chat` API from Phase 3.

## 3. Containerization Approach (using Gordon)

We will use **Gordon**, an AI-assisted Dockerfile generation tool, to create optimized container images. The process involves providing Gordon with high-level context, and it will generate the Dockerfiles.

### 3.1. Backend Container (`todo-backend`)

-   **Gordon Prompt & Context:**
    -   **Name:** `todo-backend`
    -   **Application Type:** Python (FastAPI)
    -   **Source Code Context:** `phase2/backend` and `phase3/backend` directories.
    -   **Dependencies File:** `phase2/backend/requirements.txt`.
    -   **Execution Command:** `uvicorn phase3.backend.api.main:app --host 0.0.0.0 --port 8000`.
-   **Expected Output:** Gordon will generate an optimized, multi-stage `Dockerfile` that installs dependencies, copies both source directories correctly, and sets the appropriate entrypoint.

### 3.2. Frontend Container (`todo-frontend`)

-   **Gordon Prompt & Context:**
    -   **Name:** `todo-frontend`
    -   **Application Type:** JavaScript (Next.js)
    -   **Source Code Context:** `phase2/frontend` directory.
    -   **Build Command:** `npm run build`.
    -   **Start Command:** `npm run start -- --port 3000`.
-   **Expected Output:** Gordon will generate a multi-stage `Dockerfile` that builds the Next.js application for production and serves it from a lightweight Node.js image.

## 4. Kubernetes Architecture (Minikube)

-   **Namespace:** `todo-app-v4` will be created to isolate all Phase 4 resources.
-   **Deployments:**
    -   `todo-backend`: Manages pods for the unified backend container.
    -   `todo-frontend`: Manages pods for the frontend container.
    -   `postgresql`: Deployed via the Bitnami PostgreSQL Helm chart dependency.
-   **Services:**
    -   `todo-backend-svc`: **ClusterIP**. Exposes the backend internally at `http://todo-backend-svc.todo-app-v4.svc.cluster.local`.
    -   `todo-frontend-svc`: **NodePort**. Exposes the frontend to the host machine for access via `minikube service todo-frontend-svc`.
-   **Configuration:**
    -   `ConfigMap` (`todo-app-config`): Stores the `NEXT_PUBLIC_API_BASE_URL` for the frontend.
    -   `Secret` (`todo-app-secret`): Securely stores the `DATABASE_URL` and `GEMINI_API_KEY`.

## 5. Helm Chart Design

-   **Location:** `phase4/helm/todo-app`
-   **`Chart.yaml`:** Defines chart metadata and includes a dependency on the `bitnami/postgresql` chart.
-   **`values.yaml`:** Provides a single interface for configuring image tags, replica counts, ports, and passing secret values during installation.
-   **`templates/`:** Contains the templated Kubernetes manifests for all application components.

## 6. AI DevOps Tooling Usage

-   **Gordon:** The designated tool for generating optimized `Dockerfile`s from high-level specifications, abstracting away boilerplate.
-   **`kubectl-ai`:** Will be used to bootstrap initial Kubernetes YAML manifests (`Deployment`, `Service`) and for real-time debugging of cluster resources (e.g., analyzing pod logs, describing misconfigurations).
-   **`kagent`:** (Forward-looking) `kagent` will be explored for in-cluster autonomous operations after the initial deployment is stable. Potential use cases include automated health checks and log analysis.
