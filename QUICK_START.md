# 🚀 Quick Start - Fix Image Upload Issue

## The Problem
You're seeing a CORS error when uploading menu images. This means Firebase Storage needs to be enabled.

## ⚡ Fastest Fix (5 minutes)

### Option 1: Manual Setup (Recommended)

1. **Enable Storage:**
   - Go to https://console.firebase.google.com/project/whome-c5ac3/storage
   - Click **"Get Started"**
   - Choose location (e.g., `us-central`)
   - Click **"Done"**

2. **Update Storage Rules:**
   - Click **"Rules"** tab
   - Replace everything with:
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
   - Click **"Publish"**

3. **Wait 1-2 minutes**, then test upload at http://localhost:3000/admin

### Option 2: Automated Setup

```bash
# Make script executable
chmod +x scripts/setup-firebase.sh

# Run setup
./scripts/setup-firebase.sh
```

## ✅ Verify It Works

1. Go to http://localhost:3000/admin
2. Click "Having issues with image uploads?"
3. Click "Run Diagnostic"
4. All should be green ✅

## 📚 Need More Help?

- Detailed guide: `FIREBASE_DEPLOYMENT_GUIDE.md`
- Storage setup: `MENU_STORAGE_SETUP.md`

## 🔄 Deploy Rules Later

After initial setup, deploy rules anytime:

```bash
npm run firebase:deploy
```

That's it! 🎉
