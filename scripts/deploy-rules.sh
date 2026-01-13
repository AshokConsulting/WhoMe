#!/bin/bash

# Quick script to deploy Firebase rules
# Usage: ./scripts/deploy-rules.sh

set -e

echo "🔥 Deploying Firebase Security Rules..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "Run: npm install -g firebase-tools"
    exit 1
fi

# Deploy rules
firebase deploy --only firestore:rules,storage:rules

echo ""
echo "✅ Rules deployed successfully!"
echo ""
echo "Note: It may take 1-2 minutes for rules to propagate."
echo "Test your upload at: http://localhost:3000/admin"
