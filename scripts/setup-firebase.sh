#!/bin/bash

# Firebase Setup Script for WhoMe POS
# This script helps you set up Firebase Storage and deploy security rules

set -e

echo "🔥 Firebase Setup Script for WhoMe POS"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed${NC}"
    echo ""
    echo "Installing Firebase CLI globally..."
    npm install -g firebase-tools
    echo -e "${GREEN}✅ Firebase CLI installed${NC}"
else
    echo -e "${GREEN}✅ Firebase CLI is already installed${NC}"
fi

echo ""
echo "Checking Firebase login status..."

# Check if user is logged in
if firebase projects:list &> /dev/null; then
    echo -e "${GREEN}✅ Already logged in to Firebase${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "Opening browser for login..."
    firebase login
fi

echo ""
echo "Current Firebase project:"
firebase use --add

echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Make sure Firebase Storage is enabled in Firebase Console"
echo "2. Go to: https://console.firebase.google.com/project/whome-c5ac3/storage"
echo "3. Click 'Get Started' if Storage is not enabled"
echo ""
echo "Press ENTER when Storage is enabled..."
read

echo ""
echo "Deploying security rules..."
firebase deploy --only firestore:rules,storage:rules

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to http://localhost:3000/admin"
echo "2. Click 'Having issues with image uploads?'"
echo "3. Run the diagnostic to verify everything works"
echo ""
echo "If you see any errors, check FIREBASE_DEPLOYMENT_GUIDE.md"
