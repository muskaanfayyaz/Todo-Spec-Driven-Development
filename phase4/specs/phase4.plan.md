# Phase 4 Execution Plan

This plan details the ordered steps required to implement the local Kubernetes deployment as defined in `phase4.spec.md`.

## Phase 1: Containerization

**Objective:** Create optimized, self-contained Docker images for the frontend and backend services.

-   **Task 1.1: Generate Backend Dockerfile**
    -   **Tool:** Gordon (AI Dockerfile Generator)
    -   **Action:** Provide Gordon with the context for the unified backend service, referencing the `phase2/backend` and `phase3/backend` source directories and the `uvicorn` startup command.
    -   **Output:** An optimized `phase4/backend/Dockerfile`.

-   **Task 1.2: Generate Frontend Dockerfile**
    -   **Tool:** Gordon
    -   **Action:** Provide Gordon with the context for the frontend web application, referencing the `phase2/frontend` source and specifying a multi-stage build strategy.
    -   **Output:** An optimized `phase4/frontend/Dockerfile`.

-   **Task 1.3: Build and Load Images into Minikube**
    -   **Tool:** `minikube image build` command.
    -   **Action:** Build the `todo-backend:v1` and `todo-frontend:v1` images directly into the Minikube cluster's Docker daemon. This avoids the need for a separate Docker registry.

-   **Validation Checkpoint 1:**
    -   Execute `minikube image ls`.
    -   **Expected Result:** Both `docker.io/library/todo-backend:v1` and `docker.io/library/todo-frontend:v1` are listed.

## Phase 2: Helm Chart Scaffolding

**Objective:** Create and configure the parent Helm chart that will manage all application components.

-   **Task 2.1: Create Initial Chart Structure**
    -   **Tool:** `helm`
    -   **Action:** Run `helm create todo-app` inside the `phase4/helm/` directory.

-   **Task 2.2: Configure Chart Dependencies**
    -   **Action:** Edit `phase4/helm/todo-app/Chart.yaml` to remove the default content and add the `bitnami/postgresql` chart as a dependency.
    -   **Action:** Edit `phase4/helm/todo-app/values.yaml`, clearing default values and structuring it to manage `backend`, `frontend`, and `postgresql` configurations.

-   **Task 2.3: Fetch Dependencies**
    -   **Tool:** `helm`
    -   **Action:** Run `helm dependency update phase4/helm/todo-app/`.

-   **Validation Checkpoint 2:**
    -   Run `helm lint phase4/helm/todo-app/`.
    -   **Expected Result:** The linter passes, and a `postgresql-*.tgz` archive is present in the `phase4/helm/todo-app/charts/` directory.

## Phase 3: Kubernetes Manifest Templating

**Objective:** Generate and templatize the Kubernetes manifests for our custom services.

-   **Task 3.1: Generate Baseline Manifests**
    -   **Tool:** `kubectl-ai`
    -   **Action:** Use `kubectl ai create deployment ...` and `kubectl ai create service ...` commands to generate the initial YAML for the `todo-backend` and `todo-frontend` deployments and services (`ClusterIP` for backend, `NodePort` for frontend).

-   **Task 3.2: Convert YAML to Helm Templates**
    -   **Action:** Move the generated YAML files into the `phase4/helm/todo-app/templates/` directory.
    -   **Action:** Systematically replace hardcoded values (e.g., image tags, replica counts, ports) with Helm template expressions that reference `values.yaml` (e.g., `{{ .Values.backend.image.tag }}`).

-   **Task 3.3: Create Configuration Manifests**
    -   **Action:** Manually create `templates/configmap.yaml` and `templates/secret.yaml`, ensuring all values are templated from `values.yaml`. The secret values will be base64 encoded by Helm during installation.

-   **Validation Checkpoint 3:**
    -   Run `helm template todo-app phase4/helm/todo-app/`.
    -   **Expected Result:** The command outputs valid Kubernetes YAML for all expected resources (`Deployments`, `Services`, `ConfigMap`, `Secret`, and `PostgreSQL` sub-chart resources) without errors.

## Phase 4: Deployment and Verification

**Objective:** Deploy the application to Minikube and validate its end-to-end functionality.

-   **Task 4.1: Install Helm Chart**
    -   **Tool:** `helm`
    -   **Action:** Run `helm install todo-release phase4/helm/todo-app/ --namespace todo-app-v4 --create-namespace` to deploy the application stack. Pass the `GEMINI_API_KEY` via `--set` or a temporary values file.

-   **Task 4.2: Verify Pod Status**
    -   **Tool:** `kubectl`
    -   **Action:** Run `kubectl get pods -n todo-app-v4 -w`.

-   **Validation Checkpoint 4:**
    -   **Expected Result:** All pods (`todo-backend-*`, `todo-frontend-*`, `postgresql-*`) achieve `Running` status.
    -   Use `kubectl logs` on each pod to check for runtime errors.

-   **Task 4.3: End-to-End Functional Test**
    -   **Tool:** `minikube`, Web Browser
    -   **Action:** Run `minikube service todo-frontend-svc -n todo-app-v4` to get the URL and open the application.
    -   **Validation Steps:**
        1.  Successfully load the frontend UI.
        2.  Create a new user and log in.
        3.  Create a new task via the UI.
        4.  Interact with the AI chatbot to create a second task.
        5.  **Expected Result:** Both tasks are visible on the dashboard, confirming the frontend, backend, AI service, and database are all communicating correctly.

## Phase 5: AI DevOps Exploration

**Objective:** Demonstrate the use of AI tools for post-deployment operations.

-   **Task 5.1: Troubleshoot with AI**
    -   **Tool:** `kubectl-ai`
    -   **Action:** In case of errors during deployment, use `kubectl ai analyze pod <pod-name>` to get a diagnosis and suggested fix.

-   **Task 5.2: Document Autonomous Agent Potential**
    -   **Tool:** `kagent` (Conceptual)
    -   **Action:** Add a section to the `phase4/README.md` outlining how `kagent` could be used in a production cluster for autonomous monitoring, log analysis, and incident response.
