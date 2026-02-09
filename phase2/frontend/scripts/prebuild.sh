#!/bin/bash
set -e

# Clean up any previous copy
rm -rf ./components/chat

# Copy the chat components from phase3 to phase2
cp -r ../../phase3/frontend/components/chat ./components/chat
