# Quick Setup Instructions

Follow these steps to add the coffee shop menu items to your Firebase database.

## Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

## Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded file as `serviceAccountKey.json` in your project root:
   ```
   /Users/ashokjaiswal/WhoMeWeb/serviceAccountKey.json
   ```

## Step 3: Run the Script

Option A - Using npm script (recommended):
```bash
npm run add-coffee-menu
```

Option B - Direct node command:
```bash
node scripts/addCoffeeMenuItems.js
```

## What Happens

The script will:
1. ✅ Download 16 product images from Unsplash
2. ✅ Upload them to Firebase Storage
3. ✅ Create 16 menu items in Firestore
4. ✅ Clean up temporary files

Expected output:
```
Starting to add coffee shop menu items...
Total items to add: 16

Processing: Espresso
  Downloading image...
  Uploading to Firebase Storage...
  Adding to Firestore...
  ✓ Successfully added Espresso (ID: abc123)

[... continues for all 16 items ...]

==================================================
Completed!
  Success: 16
  Failed: 0
  Total: 16
==================================================
```

## Verify in Admin Panel

After running the script:
1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:3000/admin`
3. You should see the new coffee and pastry items!

## Troubleshooting

### "Cannot find module 'firebase-admin'"
Run: `npm install firebase-admin`

### "Cannot find module '../serviceAccountKey.json'"
Make sure you downloaded the service account key and placed it in the project root with the exact filename `serviceAccountKey.json`

### "Permission denied" or "Storage bucket not found"
- Ensure Firebase Storage is enabled in your Firebase Console
- Check that your storage rules allow writes
- Verify the storage bucket name matches your project

## Security Note

⚠️ The `serviceAccountKey.json` file is already added to `.gitignore` - never commit it to version control!
