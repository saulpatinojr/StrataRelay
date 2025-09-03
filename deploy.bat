@echo off
echo 🚀 Starting StrataRelay deployment to Firebase...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Login to Firebase
echo 🔐 Checking Firebase authentication...
firebase login --no-localhost

REM Build the React application
echo 🔨 Building React application...
npm run build

REM Deploy to Firebase Hosting
echo 🌐 Deploying to Firebase Hosting...
firebase deploy --only hosting

REM Deploy Firestore rules and indexes
echo 🔥 Deploying Firestore rules and indexes...
firebase deploy --only firestore

REM Deploy Storage rules
echo 📦 Deploying Storage rules...
firebase deploy --only storage

echo ✅ Deployment complete!
echo 🌍 Your app is live at: https://stratarelay-analytics.web.app
pause