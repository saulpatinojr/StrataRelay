# StrataRelay Firebase Deployment Guide

## Prerequisites

1. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Create a new project at [Firebase Console](https://console.firebase.google.com)
   - Project ID: `stratarelay-analytics` (or your preferred name)
   - Enable Firestore Database
   - Enable Firebase Storage
   - Enable Firebase Hosting

## Setup Steps

### 1. Configure Environment Variables

Edit `.env` file with your Firebase project credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 2. Initialize Firebase (First Time Only)

```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Select:
# - Hosting
# - Firestore
# - Storage
# - Functions (optional)
```

### 3. Deploy Application

#### Option A: Quick Deploy (Windows)
```bash
deploy.bat
```

#### Option B: Quick Deploy (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Option C: Manual Deploy
```bash
# Build the app
npm run build

# Deploy everything
firebase deploy

# Or deploy specific services
npm run deploy:hosting     # Just the web app
npm run deploy:firestore   # Just database rules
npm run deploy:storage     # Just storage rules
```

## Deployment Commands

| Command | Description |
|---------|-------------|
| `npm run deploy` | Build and deploy everything |
| `npm run deploy:hosting` | Deploy web app only |
| `npm run deploy:firestore` | Deploy Firestore rules |
| `npm run deploy:storage` | Deploy Storage rules |
| `firebase deploy --only functions` | Deploy Cloud Functions |

## Post-Deployment

1. **Verify Deployment**: Visit your Firebase Hosting URL
2. **Test File Upload**: Ensure Firebase Storage is working
3. **Check Console**: Monitor Firebase Console for any issues

## Troubleshooting

### Common Issues

1. **Build Errors**: Check for missing dependencies
   ```bash
   npm install
   npm run build
   ```

2. **Firebase Auth**: Re-login if deployment fails
   ```bash
   firebase logout
   firebase login
   ```

3. **Environment Variables**: Ensure all Firebase config is correct in `.env`

4. **Permissions**: Check Firebase project permissions and billing

### Useful Commands

```bash
# Check Firebase status
firebase projects:list

# View deployment history
firebase hosting:channel:list

# Rollback deployment
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:TARGET_CHANNEL_ID
```

## Security Notes

- Firestore and Storage rules are set to allow all access for development
- Update security rules for production use
- Never commit real API keys to version control
- Use Firebase environment config for sensitive data

## URLs After Deployment

- **Web App**: `https://your-project-id.web.app`
- **Firebase Console**: `https://console.firebase.google.com/project/your-project-id`
- **Firestore**: Available through Firebase Console
- **Storage**: Available through Firebase Console