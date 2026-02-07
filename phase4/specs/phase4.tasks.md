# Phase 4 Atomic Task List

This document breaks down the Phase 4 execution plan into atomic, reviewable tasks.

| Task ID | Purpose                                                              | Phases Touched             | AI Tool / Command       | Expected Output                                                          |
| :------ | :------------------------------------------------------------------- | :------------------------- | :---------------------- | :----------------------------------------------------------------------- |
| **P1: Containerization** |
| T4.1.1  | Generate the Dockerfile for the unified backend service.             | 2 (Backend), 3 (Backend)   | Gordon                  | `phase4/backend/Dockerfile` created.                                     |
| T4.1.2  | Generate the Dockerfile for the frontend web application.            | 2 (Frontend)               | Gordon                  | `phase4/frontend/Dockerfile` created.                                    |
| T4.1.3  | Build container images and load them into Minikube's registry.       | N/A                        | `minikube image build`  | `todo-backend:v1` & `todo-frontend:v1` images available in Minikube.     |
| **P2: Helm Scaffolding** |
| T4.2.1  | Create the skeleton Helm chart structure.                            | N/A                        | `helm create`           | Helm chart directory structure created at `phase4/helm/todo-app`.        |
| T4.2.2  | Configure `Chart.yaml` to add the PostgreSQL dependency.             | N/A                        | Manual Edit             | Modified `phase4/helm/todo-app/Chart.yaml`.                              |
| T4.2.3  | Structure the `values.yaml` file for application configuration.      | N/A                        | Manual Edit             | Modified `phase4/helm/todo-app/values.yaml` with app-specific keys.      |
| T4.2.4  | Fetch and package the PostgreSQL Helm chart dependency.              | N/A                        | `helm dependency update`| `postgresql-*.tgz` downloaded into the `charts/` directory.              |
| **P3: Manifest Templating** |
| T4.3.1  | Generate baseline YAML for the backend Deployment and Service.       | N/A                        | `kubectl-ai`            | `backend-deployment.yaml` and `backend-service.yaml` files generated.    |
| T4.3.2  | Generate baseline YAML for the frontend Deployment and Service.      | N/A                        | `kubectl-ai`            | `frontend-deployment.yaml` and `frontend-service.yaml` files generated.  |
| T4.3.3  | Convert generated YAML files into dynamic Helm templates.            | N/A                        | Manual Edit             | Kubernetes manifests in `templates/` populated with Helm expressions.    |
| T4.3.4  | Create `ConfigMap` and `Secret` templates for runtime configuration. | N/A                        | Manual Edit             | `configmap.yaml` and `secret.yaml` files created in `templates/`.        |
| **P4: Deployment & Verification** |
| T4.4.1  | Install the Helm chart to deploy the full application stack.         | N/A                        | `helm install`          | A successful Helm release in the `todo-app-v4` Kubernetes namespace.     |
| T4.4.2  | Verify all pods are running and check for critical errors.           | N/A                        | `kubectl`               | All pods in the release show `Running` status with no crash loops.       |
| T4.4.3  | Perform and validate an end-to-end user acceptance test.             | 2 (Full-stack), 3 (Chatbot)| Browser                 | A fully functional application, accessible and usable via the browser.   |
| **P5: Documentation** |
| T4.5.1  | Document the usage of `kubectl-ai` for troubleshooting.            | N/A                        | `kubectl-ai` (Reference)| A new section added to a `phase4/README.md` file.                        |
