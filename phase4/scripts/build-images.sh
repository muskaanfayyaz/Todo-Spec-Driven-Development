#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Switching Docker environment to Minikube..."
# This command configures your shell to use the Docker daemon inside Minikube.
# This means any subsequent 'docker' commands will interact with Minikube's Docker.
eval $(minikube docker-env)

echo "Building todo-frontend:phase4 image..."
# Build the frontend image using the Dockerfile located in phase4/docker/.
# The build context '.' (current directory) is used because the Dockerfile
# copies files from phase2/frontend and phase3/frontend, which are relative
# to the project root.
docker build -f phase4/docker/frontend.Dockerfile -t todo-frontend:phase4 .

echo "Building todo-backend:phase4 image..."
# Build the backend image using the Dockerfile located in phase4/docker/.
# Similar to the frontend, the build context is the project root to allow
# the Dockerfile to access code from phase2/backend and phase3/backend.
docker build -f phase4/docker/backend.Dockerfile -t todo-backend:phase4 .

echo "Docker images built successfully within Minikube's environment."

# To revert the Docker environment back to your host's default, you would run:
# eval $(minikube docker-env -u)
# This script does NOT do that automatically, to allow further Minikube-related
# Docker operations if needed.
