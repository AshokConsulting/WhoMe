# Face Recognition Setup Guide for Junior Engineers

## Overview
This guide explains how to enable and configure face recognition in the WhoMe application. The system uses `@vladmandic/face-api` library with pre-trained models for facial detection, landmark detection, and face recognition.

---

## Prerequisites

### 1. Required Dependencies
Ensure these packages are installed (already in `package.json`):
```json
"@vladmandic/face-api": "^1.7.15"
"@tensorflow/tfjs": "^4.22.0"
"firebase": "^12.7.0"
```

### 2. Face Recognition Models
The application requires three pre-trained models located in:
**`/Users/ashokjaiswal/WhoMeWeb/public/models/`**

Required model files:
- `ssd_mobilenetv1_model-shard1` (4.2 MB)
- `ssd_mobilenetv1_model-shard2` (1.4 MB)
- `ssd_mobilenetv1_model-weights_manifest.json`
- `face_landmark_68_model-shard1` (357 KB)
- `face_landmark_68_model-weights_manifest.json`
- `face_recognition_model-shard1` (4.2 MB)
- `face_recognition_model-shard2` (2.2 MB)
- `face_recognition_model-weights_manifest.json`

**Note:** These models are already present in the project. If missing, download from the face-api.js repository.

---

## Core Files and Their Roles

### 1. **Face Recognition Library**
**File:** `/Users/ashokjaiswal/WhoMeWeb/lib/faceRecognition.ts`

**Purpose:** Core face recognition functionality

**Key Functions:**
- `loadFaceRecognitionModels()` - Loads the three required models from `/models` directory
- `detectSingleFace(input)` - Detects one face in video/image
- `detectAllFaces(input)` - Detects multiple faces
- `getFaceDescriptor(detection)` - Extracts 128-dimensional face descriptor
- `compareFaceDescriptors(d1, d2)` - Compares two face descriptors (returns similarity 0-1)
- `recognizeFace(imageData)` - Main recognition function that matches against stored users
- `captureFaceImage(video)` - Captures image from video stream
- `descriptorToString(descriptor)` - Converts Float32Array to JSON string for storage
- `stringToDescriptor(str)` - Converts stored JSON back to Float32Array

**Recognition Threshold:** 0.6 (60% similarity required for match)

---

### 2. **User Service**
**File:** `/Users/ashokjaiswal/WhoMeWeb/lib/userService.ts`

**Purpose:** Manages user data in Firebase Firestore

**Key Functions:**
- `registerUser(userData)` - Stores user with face descriptor
- `getAllUsers()` - Retrieves all registered users
- `findUserByEmail(email)` - Finds specific user

**User Data Structure:**
```typescript
interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  faceData: string;              // 128-dim descriptor as JSON string
  faceImageUrl?: string;          // Base64 image
  profilePhotoUrl?: string;
  registeredAt: Timestamp;
  lastGreeted?: Timestamp;
}
```

---

### 3. **Firebase Configuration**
**File:** `/Users/ashokjaiswal/WhoMeWeb/lib/firebase.ts`

**Purpose:** Firebase initialization

**Required Environment Variables:**
Create `.env.local` file with:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## Application Pages Using Face Recognition

### 1. **Home Page (Main Recognition)**
**File:** `/Users/ashokjaiswal/WhoMeWeb/app/page.tsx`

**Flow:**
1. Starts camera automatically
2. Scans face every 2 seconds
3. After 10 failed attempts, redirects to registration
4. On successful recognition, redirects to menu with user info

**Key Parameters:**
- Scan interval: 2000ms (2 seconds)
- Max scan attempts: 10
- Video resolution: 1280x720

---

### 2. **Registration Page**
**File:** `/Users/ashokjaiswal/WhoMeWeb/app/register/page.tsx`

**Flow:**
1. User enters name, email, phone
2. Camera captures face
3. Extracts face descriptor (128-dimensional vector)
4. Stores user data with descriptor in Firestore
5. Redirects to menu

**Important:** Face descriptor is stored as JSON string in `faceData` field

---

### 3. **Greeting Page**
**File:** `/Users/ashokjaiswal/WhoMeWeb/app/greet/page.tsx`

**Flow:**
1. Loads all users from database
2. Continuously scans for faces
3. Compares detected face with all stored users
4. Displays greeting when match found (>60% similarity)

**Scan interval:** 2000ms

---

### 4. **POS Page**
**File:** `/Users/ashokjaiswal/WhoMeWeb/app/pos/page.tsx`

**Flow:**
1. Scans for customer face
2. Recognizes returning customers
3. Displays customer info for personalized service

**Scan interval:** 1000ms (faster for POS)

---

## How to Enable Face Recognition

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Firebase
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Storage
4. Copy configuration to `.env.local`

### Step 3: Verify Models
Check that model files exist in `/Users/ashokjaiswal/WhoMeWeb/public/models/`

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Test Recognition
1. Navigate to http://localhost:3000
2. Allow camera permissions
3. Register a user via `/register` page
4. Test recognition on home page

---

## How Face Recognition Works

### Registration Process:
1. **Capture** → Camera captures user's face
2. **Detect** → `detectSingleFace()` finds face in image
3. **Extract** → `getFaceDescriptor()` creates 128-dim vector
4. **Store** → Descriptor saved as JSON string in Firestore

### Recognition Process:
1. **Capture** → Camera captures current frame
2. **Detect** → Find face in frame
3. **Extract** → Get descriptor from detected face
4. **Compare** → Calculate similarity with all stored users using Euclidean distance
5. **Match** → If similarity > 0.6 (60%), user is recognized

### Similarity Calculation:
```typescript
distance = euclideanDistance(descriptor1, descriptor2)
similarity = 1 - distance
// Match if similarity > 0.6
```

---

## Troubleshooting

### Models Not Loading
- **Error:** "Failed to load face recognition models"
- **Solution:** Verify all 8 model files exist in `/public/models/`
- **Check:** Browser console for 404 errors on model files

### Camera Not Working
- **Error:** "Unable to access camera"
- **Solution:** Grant camera permissions in browser
- **Check:** HTTPS required for camera access (or localhost)

### No Face Detected
- **Cause:** Poor lighting, face too far/close, angle issues
- **Solution:** Ensure good lighting, face camera directly, distance 1-2 feet

### Recognition Not Working
- **Cause:** Low similarity score (<0.6)
- **Solution:** Re-register user with better quality image
- **Adjust:** Lower threshold in `faceRecognition.ts` line 174 (not recommended)

### Firebase Errors
- **Error:** "Permission denied"
- **Solution:** Check Firestore security rules
- **Verify:** Environment variables in `.env.local`

---

## Performance Optimization

### Current Settings:
- **Home page:** 2-second scan interval (balanced)
- **POS page:** 1-second scan interval (faster response)
- **Greet page:** 2-second scan interval

### To Adjust Scan Speed:
Modify interval in `setInterval()` calls:
```typescript
// Faster (more CPU usage)
setInterval(scanForFaces, 1000);

// Slower (less CPU usage)
setInterval(scanForFaces, 3000);
```

---

## Security Considerations

1. **Face descriptors** are stored as 128-dimensional vectors (not actual images)
2. **Similarity threshold** of 0.6 balances security vs. usability
3. **Firebase rules** should restrict write access to authenticated users
4. **HTTPS** required for camera access in production

---

## Summary of Full File Paths

### Core Files:
- `/Users/ashokjaiswal/WhoMeWeb/lib/faceRecognition.ts` - Face recognition logic
- `/Users/ashokjaiswal/WhoMeWeb/lib/userService.ts` - User database operations
- `/Users/ashokjaiswal/WhoMeWeb/lib/firebase.ts` - Firebase configuration

### Application Pages:
- `/Users/ashokjaiswal/WhoMeWeb/app/page.tsx` - Main recognition page
- `/Users/ashokjaiswal/WhoMeWeb/app/register/page.tsx` - User registration
- `/Users/ashokjaiswal/WhoMeWeb/app/greet/page.tsx` - Greeting system
- `/Users/ashokjaiswal/WhoMeWeb/app/pos/page.tsx` - POS recognition

### Configuration:
- `/Users/ashokjaiswal/WhoMeWeb/package.json` - Dependencies
- `/Users/ashokjaiswal/WhoMeWeb/.env.local` - Firebase credentials (create this)

### Models Directory:
- `/Users/ashokjaiswal/WhoMeWeb/public/models/` - Pre-trained models (8 files)

---

## Quick Start Checklist

- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` with Firebase credentials
- [ ] Verify 8 model files in `/public/models/`
- [ ] Run dev server: `npm run dev`
- [ ] Allow camera permissions
- [ ] Register first user at `/register`
- [ ] Test recognition at home page

---

## Additional Resources

- **face-api.js Documentation:** https://github.com/vladmandic/face-api
- **Firebase Documentation:** https://firebase.google.com/docs
- **Next.js Documentation:** https://nextjs.org/docs

---

**Last Updated:** January 2026
**Maintained By:** WhoMe Development Team
