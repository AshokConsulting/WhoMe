# Firebase Storage Setup - IMPORTANT

## Current Status

The app is currently storing face images directly in Firestore to avoid CORS issues. To enable Firebase Storage (recommended for production), follow these steps:

## Step-by-Step Setup

### 1. Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **whome-c5ac3**
3. Click on **Storage** in the left sidebar
4. Click **Get Started**
5. Click **Next** on the security rules dialog
6. Select your preferred location (same as Firestore if possible)
7. Click **Done**

### 2. Configure Storage Rules

After enabling Storage, update the security rules:

1. In Firebase Console, go to **Storage** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** These rules allow all access. For production, you should add authentication.

3. Click **Publish**

### 3. Enable Firestore Database

If you haven't already:

1. Go to **Firestore Database** in Firebase Console
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select your preferred location
5. Click **Enable**

### 4. Configure Firestore Rules

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

### 5. Update the Code (Optional - After Storage is Set Up)

Once Storage is properly configured, you can uncomment the Storage upload code in `lib/userService.ts`:

```typescript
export async function registerUser(userData: Omit<User, 'id' | 'registeredAt'>) {
  try {
    // Upload to Firebase Storage
    const storageRef = ref(storage, `faces/${Date.now()}_${userData.email}.jpg`);
    await uploadString(storageRef, userData.faceData, 'data_url');
    const faceImageUrl = await getDownloadURL(storageRef);
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      faceImageUrl,
      registeredAt: Timestamp.now(),
    });
    
    return { id: docRef.id, ...userData, faceImageUrl };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}
```

## Current Workaround

The app currently stores face data (base64 images) directly in Firestore. This works but has limitations:

- **Pros**: No CORS issues, works immediately
- **Cons**: Firestore has document size limits (1MB), less efficient for images

## Testing

After setup, try registering a new user. If you see the CORS error again:

1. Wait 5-10 minutes for Firebase rules to propagate
2. Clear browser cache
3. Try in an incognito/private window
4. Check Firebase Console → Storage → Files to see if uploads are working

## Troubleshooting

### CORS Error Persists
- Ensure Storage is enabled in Firebase Console
- Check that rules are published
- Wait for rule propagation (up to 10 minutes)
- Try accessing from `http://localhost:3000` not `127.0.0.1`

### Permission Denied
- Check Firestore and Storage rules are set to allow all (for development)
- Verify your Firebase config in `lib/firebase.ts` is correct

### Storage Not Showing Files
- Files may be uploading but rules prevent reading
- Check Storage rules allow read access
- Verify the bucket name matches your config

## Production Security

For production, implement proper security:

```javascript
// Storage Rules (Production)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /faces/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}

// Firestore Rules (Production)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Then add Firebase Authentication to your app.
