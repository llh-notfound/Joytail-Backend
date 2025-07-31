#!/bin/bash

# PetPal Backend Server Entrypoint
echo "Starting PetPal Backend Server..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the backend server
echo "Starting server on port 8080..."
npm start