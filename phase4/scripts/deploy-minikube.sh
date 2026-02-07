#!/bin/bash

# Script to deploy the Todo Chatbot application to Minikube

set -e

NAMESPACE="todo-phase4"
HELM_RELEASE_NAME="todo-app"
BUILD_IMAGES_SCRIPT="./build-images.sh"

echo "================================================"
echo "Starting Minikube Deployment for Todo Chatbot"
echo "================================================"

# 1. Start Minikube (if not already running)
echo "1. Checking Minikube status and starting if necessary..."
if ! minikube status &>/dev/null; then
    echo "Minikube is not running. Starting Minikube..."
    minikube start
else
    echo "Minikube is already running."
fi

# 2. Switch Docker Environment to Minikube
echo "2. Switching Docker environment to Minikube..."
eval $(minikube docker-env)

# 3. Build Docker Images
echo "3. Building Docker images within Minikube's Docker daemon..."
if [ -f "$BUILD_IMAGES_SCRIPT" ]; then
    bash "$BUILD_IMAGES_SCRIPT"
else
    echo "Error: Build script $BUILD_IMAGES_SCRIPT not found. Please ensure it exists."
    exit 1
fi

# 4. Create Kubernetes Namespace
echo "4. Creating Kubernetes namespace: $NAMESPACE..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# 5. Create Kubernetes Secrets for Backend
echo "5. Creating Kubernetes Secrets for the backend."
echo "Please enter your DATABASE_URL (e.g., postgresql://user:password@host:port/database):"
read -r DATABASE_URL
echo "Please enter your GEMINI_API_KEY:"
read -r GEMINI_API_KEY

kubectl create secret generic todo-backend-secrets --namespace "$NAMESPACE" 
  --from-literal=DATABASE_URL="$DATABASE_URL" 
  --from-literal=GEMINI_API_KEY="$GEMINI_API_KEY" --dry-run=client -o yaml | kubectl apply -f -

# 6. Install the Helm Chart
echo "6. Installing Helm chart '$HELM_RELEASE_NAME' in namespace '$NAMESPACE'..."
helm install "$HELM_RELEASE_NAME" ../helm --namespace "$NAMESPACE"

echo "================================================"
echo "Deployment initiated. Verifying services..."
echo "================================================"

# 7. Validation Steps
echo "Waiting for pods to be ready (this might take a minute)..."
kubectl wait --for=condition=ready pod -l app=todo-backend -n "$NAMESPACE" --timeout=300s
kubectl wait --for=condition=ready pod -l app=todo-frontend -n "$NAMESPACE" --timeout=300s

echo "Pods are ready. Displaying status:"
echo "--- Pods ---"
kubectl get pods -n "$NAMESPACE"

echo "--- Services ---"
kubectl get svc -n "$NAMESPACE"

echo "--- Helm Releases ---"
helm list -n "$NAMESPACE"

echo "================================================"
echo "Deployment Complete!"
echo "You can now access the frontend application:"
echo "================================================"

minikube service "$HELM_RELEASE_NAME"-todo-frontend --namespace "$NAMESPACE"

echo "To clean up, run:"
echo "helm uninstall $HELM_RELEASE_NAME --namespace $NAMESPACE"
echo "kubectl delete namespace $NAMESPACE"
