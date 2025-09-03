#!/bin/bash

echo "🚀 Starting StrataRelay deployment to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --no-localhost

# Build the React application
echo "🔨 Building React application..."
npm run build

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Deploy Firestore rules and indexes
echo "🔥 Deploying Firestore rules and indexes..."
firebase deploy --only firestore

# Deploy Storage rules
echo "📦 Deploying Storage rules..."
firebase deploy --only storage

echo "✅ Deployment complete!"
echo "🌍 Your app is live at: https://stratarelay-analytics.web.app"