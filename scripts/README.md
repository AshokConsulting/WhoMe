# Add Coffee Shop Menu Items Script

This script downloads images from Unsplash URLs and adds coffee shop menu items to your Firebase Firestore database.

## Prerequisites

1. **Firebase Admin SDK**: Install the required package
   ```bash
   npm install firebase-admin
   ```

2. **Service Account Key**: You need a Firebase service account key file
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the file as `serviceAccountKey.json` in the project root directory
   - **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` to keep it secure

3. **Firebase Storage**: Ensure Firebase Storage is enabled in your Firebase project
   - Go to Firebase Console → Storage
   - Enable Storage if not already enabled
   - Make sure storage rules allow writes (check your `storage.rules` file)

## Setup

1. Install dependencies:
   ```bash
   npm install firebase-admin
   ```

2. Place your `serviceAccountKey.json` in the project root:
   ```
   /Users/ashokjaiswal/WhoMeWeb/
   ├── serviceAccountKey.json  ← Place here
   ├── scripts/
   │   └── addCoffeeMenuItems.js
   └── ...
   ```

3. Verify your `.env.local` has the correct Firebase Storage bucket:
   ```
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

## Usage

Run the script from the project root:

```bash
node scripts/addCoffeeMenuItems.js
```

## What the Script Does

1. **Downloads Images**: Fetches 16 product images from Unsplash URLs
2. **Uploads to Firebase Storage**: Stores images in your Firebase Storage bucket under `menu/` folder
3. **Creates Firestore Documents**: Adds menu items to the `menuItems` collection with:
   - Title
   - Description
   - Price
   - Category (mapped to existing categories: Beverages, Breakfast)
   - Image URL and path
   - Availability status
   - Timestamps

## Menu Items Added

### Coffee (8 items)
- Espresso ($2.50)
- Cappuccino ($3.75)
- Latte ($4.00)
- Americano ($3.00)
- Mocha ($4.50)
- Flat White ($4.25)
- Cold Brew ($4.00)
- Macchiato ($3.50)

### Pastries (6 items)
- Croissant ($3.50)
- Blueberry Muffin ($3.00)
- Chocolate Cookie ($2.50)
- Bagel ($2.75)
- Cinnamon Roll ($4.00)
- Banana Bread ($3.25)

### Other (2 items)
- Orange Juice ($3.50)
- Bottled Water ($1.50)

## Category Mapping

The script maps the product categories to your existing menu categories:
- `coffee` → `Beverages`
- `pastry` → `Breakfast`
- `other` → `Beverages`

## Troubleshooting

### Error: Cannot find module 'firebase-admin'
```bash
npm install firebase-admin
```

### Error: Cannot find module '../serviceAccountKey.json'
- Download your service account key from Firebase Console
- Place it in the project root directory
- Ensure the filename is exactly `serviceAccountKey.json`

### Error: Storage bucket not found
- Check your Firebase project has Storage enabled
- Verify the storage bucket name in your service account key or `.env.local`

### Permission Denied Errors
- Check your Firebase Storage rules allow writes
- Ensure your service account has proper permissions

## Security Notes

⚠️ **IMPORTANT**: Never commit `serviceAccountKey.json` to version control!

Add to `.gitignore`:
```
serviceAccountKey.json
```

## Output

The script provides detailed progress:
```
Processing: Espresso
  Downloading image...
  Uploading to Firebase Storage...
  Adding to Firestore...
  ✓ Successfully added Espresso (ID: abc123)

...

==================================================
Completed!
  Success: 16
  Failed: 0
  Total: 16
==================================================
```

## Cleanup

The script automatically:
- Creates a temporary `scripts/temp/` folder for downloads
- Cleans up downloaded images after upload
- Removes the temp folder when complete
