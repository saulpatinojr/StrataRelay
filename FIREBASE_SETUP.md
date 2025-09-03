# Firebase Setup Guide for StrataRelay

## 🎉 Deployment Status

✅ **Firebase Hosting**: Successfully deployed!  
🌐 **Live URL**: https://stratarelay-87aaf.web.app

⚠️ **Additional Setup Required**: Firestore and Storage need to be enabled in Firebase Console

## Required Firebase Console Setup

### 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/stratarelay-87aaf/firestore)
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (e.g., us-central1)
5. Click "Done"

### 2. Enable Firebase Storage

1. Go to [Firebase Storage](https://console.firebase.google.com/project/stratarelay-87aaf/storage)
2. Click "Get started"
3. Choose "Start in test mode" (for development)
4. Select same location as Firestore
5. Click "Done"

### 3. Get Firebase Configuration

1. Go to [Project Settings](https://console.firebase.google.com/project/stratarelay-87aaf/settings/general)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app (</>) 
4. Register app name: "StrataRelay"
5. Copy the config object
6. Update `.env` file with the actual values:

```env
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=stratarelay-87aaf.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=stratarelay-87aaf
REACT_APP_FIREBASE_STORAGE_BUCKET=stratarelay-87aaf.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
REACT_APP_FIREBASE_APP_ID=your_actual_app_id
```

## Complete Deployment After Setup

Once Firebase services are enabled:

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules  
firebase deploy --only storage

# Rebuild and redeploy with correct config
npm run build
firebase deploy --only hosting
```

## Quick Commands

```bash
# Full deployment (after Firebase setup)
npm run deploy

# Just hosting (current working deployment)
npm run deploy:hosting

# Check deployment status
firebase hosting:channel:list
```

## Current Status

- ✅ **Web App**: Live at https://stratarelay-87aaf.web.app
- ⏳ **Firestore**: Needs console setup
- ⏳ **Storage**: Needs console setup
- ✅ **Build**: Successful with warnings (non-critical)

## Next Steps

1. Complete Firebase Console setup (steps 1-3 above)
2. Update `.env` with real Firebase config
3. Run final deployment: `npm run deploy`
4. Test file upload and data persistence

## Troubleshooting

If you encounter issues:

1. **API Not Enabled**: Follow console setup steps
2. **Permission Denied**: Check Firebase project permissions
3. **Build Errors**: Run `npm install` and `npm run build`
4. **Config Issues**: Verify `.env` file has correct Firebase values

The app is already live and functional for local data processing. Firebase integration will enable cloud storage and real-time features.