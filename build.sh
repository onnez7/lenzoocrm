#!/bin/bash
set -e

echo "Installing frontend dependencies..."
npm ci --include=optional

echo "Installing backend dependencies..."
cd backend && npm ci && cd ..

echo "Building frontend..."
npm run build

echo "Building backend..."
cd backend && npm run build && cd ..

echo "Build completed successfully!" 