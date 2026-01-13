# Firebase Storage Setup for Menu Images

## Issue
Menu item images are not saving because Firebase Storage needs to be enabled and configured.

## Quick Fix - Enable Firebase Storage

### Step 1: Enable Storage in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **whome-c5ac3**
3. Click on **Storage** in the left sidebar
4. Click **Get Started** button
5. In the dialog:
   - Click **Next** on the security rules screen
   - Select your location (choose same as Firestore: `us-central` or similar)
   - Click **Done**

### Step 2: Configure Storage Security Rules

After enabling Storage, you need to set up security rules:

1. In Firebase Console, go to **Storage** → **Rules** tab
2. Replace the default rules with the following (for development):

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

3. Click **Publish** button
4. Wait 1-2 minutes for rules to propagate

### Step 3: Verify Storage Bucket Name

Check that your `.env.local` file has the correct storage bucket:

```bash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=whome-c5ac3.firebasestorage.app
```

Or it might be:
```bash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=whome-c5ac3.appspot.com
```

You can find the correct bucket name in Firebase Console → Storage → Files tab (top of page).

### Step 4: Test the Upload

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000/admin
3. Click "Add New Item"
4. Fill in the form and upload an image
5. Check browser console for any errors
6. Check Firebase Console → Storage → Files to see if the image was uploaded to the `menu/` folder

## Troubleshooting

### Error: "storage/unauthorized"
- **Cause**: Storage rules are too restrictive
- **Fix**: Update Storage rules as shown in Step 2 above

### Error: "storage/unknown" or "Firebase Storage bucket not found"
- **Cause**: Storage is not enabled in Firebase Console
- **Fix**: Follow Step 1 to enable Storage

### Error: "storage/invalid-argument"
- **Cause**: Storage bucket name is incorrect in `.env.local`
- **Fix**: Check and update `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` in `.env.local`

### Images Upload But Don't Display
- **Cause**: Storage read rules are too restrictive
- **Fix**: Ensure Storage rules allow `read: if true;`

### CORS Errors
- **Cause**: Firebase Storage CORS configuration
- **Fix**: 
  1. Wait 5-10 minutes after changing rules
  2. Clear browser cache
  3. Try in incognito/private window
  4. Access via `http://localhost:3000` not `127.0.0.1`

## Checking Current Configuration

### Check if Storage is Enabled
1. Go to Firebase Console
2. Click on Storage in sidebar
3. If you see "Get Started" button → Storage is NOT enabled
4. If you see files/folders view → Storage IS enabled

### Check Storage Rules
1. Firebase Console → Storage → Rules tab
2. Should see rules allowing read/write
3. Check "Last deployed" timestamp

### Check Environment Variables
Run this in your terminal:
```bash
cat .env.local | grep STORAGE_BUCKET
```

Should output something like:
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=whome-c5ac3.firebasestorage.app
```

## Production Security (After Development)

For production, use more restrictive rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu/{fileName} {
      // Anyone can read menu images
      allow read: if true;
      
      // Only authenticated users can write
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024  // Max 5MB
        && request.resource.contentType.matches('image/.*');  // Only images
    }
  }
}
```

Then implement Firebase Authentication in your app.

## Alternative: Store Images in Firestore (Not Recommended)

If you can't enable Storage right now, you can temporarily store images as base64 in Firestore:

⚠️ **Warning**: This is NOT recommended because:
- Firestore has 1MB document size limit
- Less efficient and more expensive
- Slower performance

Only use this as a temporary workaround while setting up Storage.
