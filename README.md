# WhoMe - Customer Recognition System

An AI-powered SaaS application that helps stores recognize and greet their customers using facial recognition technology. Built with Next.js, Firebase, and TensorFlow.js.

## Features

- 🎯 **Customer Registration**: Register new customers with their details and facial data
- 📸 **Face Scanning**: Capture and store facial features using camera
- 👋 **Automatic Greeting**: Real-time customer recognition and personalized greetings
- 🔥 **Firebase Integration**: Secure data storage with Firebase Firestore and Storage
- 🤖 **AI-Powered**: Uses TensorFlow.js and BlazeFace for face detection
- 💅 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI/ML**: TensorFlow.js, BlazeFace
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase project (already configured in this app)
- Webcam/camera access

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd /Users/ashokjaiswal/WhoMeWeb
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Camera Permissions

The app requires camera access to function properly. Make sure to:
- Allow camera permissions when prompted by your browser
- Use HTTPS in production (camera access is restricted on HTTP)
- Ensure good lighting for better face detection

## Usage

### 1. Register a Customer

1. Click "Register New Customer" on the home page
2. Fill in customer details (name, email, phone)
3. Click "Continue to Face Scan"
4. Position your face in the camera frame
5. Click "Capture Face" when ready
6. The system will detect and register the face

### 2. Greet Mode

1. Click "Greet Mode" on the home page
2. Click "Start Scanning" to activate the camera
3. The system will continuously scan for registered faces
4. When a registered customer is detected, a personalized greeting appears
5. Click "Stop Scanning" to deactivate

## Project Structure

```
/Users/ashokjaiswal/WhoMeWeb/
├── app/
│   ├── page.tsx              # Home page
│   ├── register/
│   │   └── page.tsx          # Customer registration page
│   ├── greet/
│   │   └── page.tsx          # Greet mode page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── Camera.tsx            # Camera component
├── lib/
│   ├── firebase.ts           # Firebase configuration
│   ├── faceDetection.ts      # Face detection utilities
│   └── userService.ts        # User CRUD operations
├── package.json
└── README.md
```

## Firebase Configuration

The app is pre-configured with Firebase. The configuration includes:
- Firestore for storing user data
- Firebase Storage for storing face images
- Firebase Analytics for usage tracking

## How It Works

1. **Registration Process**:
   - User enters customer details
   - Camera captures the customer's face
   - BlazeFace model detects facial features
   - Face descriptor is extracted and stored
   - Data is saved to Firebase Firestore
   - Face image is uploaded to Firebase Storage

2. **Recognition Process**:
   - Camera continuously scans for faces
   - Detected faces are compared with stored face descriptors
   - When a match is found (similarity > 70%), customer is recognized
   - Personalized greeting is displayed with customer information

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Supported (may require HTTPS)
- Mobile browsers: ✅ Supported with camera access

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Security Notes

- Camera access is only requested when needed
- All Firebase operations are client-side (consider adding Firebase Security Rules)
- Face data is stored securely in Firebase Storage
- Consider implementing authentication for production use

## Future Enhancements

- [ ] Add user authentication
- [ ] Implement Firebase Security Rules
- [ ] Add customer visit history
- [ ] Export customer data
- [ ] Multi-store support
- [ ] Advanced face recognition algorithms
- [ ] Mobile app version

## License

This project is created for demonstration purposes.

## Support

For issues or questions, please check the Firebase console and browser console for error messages.
