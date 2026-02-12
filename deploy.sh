#!/bin/bash
set -e

# Always run from this script's folder
cd "$(dirname "$0")"

# Pull latest code
git fetch origin main
git reset --hard origin/main

# Rebuild & restart
docker compose down
docker compose build
docker compose up -d

echo "✅ techgigs-crm deployed successfully!"