#!/bin/bash
# ---- start.sh ----
set -e

echo "🚀 Starting MERN backend on Railway..."

cd Backend

# Install dependencies
npm install

# Start the backend server
npm run start
