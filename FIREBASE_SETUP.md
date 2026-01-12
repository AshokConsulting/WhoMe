# Firebase Setup Guide

## Firebase Security Rules

To secure your Firebase project, add the following security rules:

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow read access to all users
      allow read: if true;
      
      // Allow write access (you may want to add authentication)
      allow write: if true;
      
      // For production, consider:
      // allow read: if request.auth != null;
      // allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /faces/{allPaths=**} {
      // Allow read access to all
      allow read: if true;
      
      // Allow write access
      allow write: if true;
      
      // For production, consider:
      // allow read: if request.auth != null;
      // allow write: if request.auth != null && 
      //   request.resource.size < 5 * 1024 * 1024 && 
      //   request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Setting Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `whome-c5ac3`
3. Navigate to **Firestore Database** and click "Create Database"
4. Choose production mode and select a location
5. Navigate to **Storage** and click "Get Started"
6. Choose production mode
7. Go to **Rules** tab in both Firestore and Storage
8. Update the rules with the ones provided above

## Firestore Data Structure

### Users Collection

```typescript
users/
  {userId}/
    - name: string
    - email: string
    - phone: string
    - faceData: string (base64 encoded face descriptor)
    - faceImageUrl: string (Firebase Storage URL)
    - registeredAt: Timestamp
    - lastGreeted: Timestamp (optional)
```

## Production Recommendations

1. **Enable Authentication**: Add Firebase Authentication to restrict access
2. **Update Security Rules**: Implement proper authentication checks
3. **Add Rate Limiting**: Prevent abuse of face detection API
4. **Implement CORS**: Configure proper CORS settings for production domain
5. **Enable Firebase App Check**: Protect against abuse
6. **Monitor Usage**: Set up Firebase Analytics and monitoring
7. **Backup Strategy**: Enable automated Firestore backups

## Environment Variables (Optional)

If you want to use environment variables instead of hardcoded config:

1. Create `.env.local` file in the root directory
2. Add the following:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCCNINQEW8Jb4i_TAvp2goqNhplMEUV0hs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=whome-c5ac3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=whome-c5ac3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=whome-c5ac3.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=796455732910
NEXT_PUBLIC_FIREBASE_APP_ID=1:796455732910:web:b9542151ca93f5def98f3f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-E0FNTB53B1
```

3. Update `lib/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```
