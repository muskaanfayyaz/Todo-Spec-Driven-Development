
## Phase IV Validation Checklist

After deploying the application to Minikube, use the following checklist to verify the successful operation of the Phase IV deployment.

### 1. Core Component Status

- [ ] **Pods Running:**
    - Verify that all pods are in a `Running` or `Completed` state and none are in `CrashLoopBackOff`.
    ```bash
    kubectl get pods -n todo-phase4
    ```
    (Expected output: `todo-backend-...   1/1     Running`, `todo-frontend-...  1/1     Running`)

- [ ] **Services Reachable:**
    - Verify that both `todo-backend` and `todo-frontend` services are running.
    ```bash
    kubectl get svc -n todo-phase4
    ```
    (Expected output: `todo-backend` of type `ClusterIP`, `todo-frontend` of type `NodePort`)

### 2. Application Functionality

- [ ] **Frontend Accessibility:**
    - Access the frontend application using the Minikube service URL.
    ```bash
    minikube service todo-frontend --namespace todo-phase4
    ```
    - Verify the frontend loads correctly in your browser.

- [ ] **Chatbot Responsiveness (End-to-End Test):**
    - Interact with the chatbot via the frontend UI.
    - Test basic commands like "Add a task to buy groceries", "List my tasks", "Complete task 1".
    - Verify that the chatbot responds appropriately and tasks are managed as expected.

- [ ] **Backend Connectivity:**
    - While interacting with the chatbot, monitor backend logs to ensure it's receiving requests and processing them without errors.
    ```bash
    kubectl logs -f $(kubectl get pods -n todo-phase4 -l app=todo-backend -o jsonpath='{.items[0].metadata.name}') -n todo-phase4
    ```

### 3. Resilience and Stability

- [ ] **No `CrashLoopBackOff`:**
    - Confirm that no pods enter a `CrashLoopBackOff` state after initial deployment or during prolonged operation.
    ```bash
    kubectl get pods -n todo-phase4 | grep -i 'CrashLoopBackOff'
    ```
    (Expected output: empty or no lines indicating CrashLoopBackOff)

### 4. Cleanup Verification

- [ ] **Helm Uninstall Works Cleanly:**
    - After verifying the deployment, perform a cleanup.
    ```bash
    helm uninstall todo-app --namespace todo-phase4
    kubectl delete namespace todo-phase4
    ```
    - Verify that all pods, services, and other resources related to the `todo-app` Helm release and `todo-phase4` namespace are removed.
    ```bash
    kubectl get all -n todo-phase4 # Should return "No resources found"
    kubectl get ns todo-phase4 # Should return "Error from server (NotFound)"
    ```

### 5. Phase 1-3 Untouched

- [ ] **Original Phases Intact:**
    - Manually verify that no files or configurations in `phase1/`, `phase2/`, or `phase3/` directories have been modified during this Phase IV deployment process. This can be done by checking `git status` from the project root if the project is under version control.
    ```bash
    git status
    ```
    (Expected output: No changes in `phase1`, `phase2`, `phase3` directories)

---
