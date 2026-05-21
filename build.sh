#!/bin/bash
set -e

echo "Building frontend..."
npm run build

echo "Building backend..."
cd backend && npm run build && cd ..

echo "Build completed successfully!" 