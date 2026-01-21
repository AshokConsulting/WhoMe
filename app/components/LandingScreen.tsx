import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, AlertCircle, X, Mail, Chrome } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { loadFaceRecognitionModels, recognizeFace, detectSingleFace, getFaceDescriptor, descriptorToString, captureFaceImage } from '../lib/faceRecognition';
import { getAllUsers, User, registerUser } from '../lib/userService';

interface LandingScreenProps {
  onSuccess: (user: User) => void;
}

export function LandingScreen({ onSuccess }: LandingScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [scanStatus, setStatus] = useState<string>('Initializing...');
  const [users, setUsers] = useState<User[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanTime, setScanTime] = useState(0);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [capturedFaceData, setCapturedFaceData] = useState<string>('');
  const [capturedFaceImage, setCapturedFaceImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const MAX_SCAN_TIME = 5;

  useEffect(() => {
    initializeFaceRecognition();

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const initializeFaceRecognition = async () => {
    try {
      setStatus('Loading face recognition models...');
      await loadFaceRecognitionModels();

      setStatus('Loading registered users...');
      const allUsers = await getAllUsers();
      setUsers(allUsers);

      setStatus('Starting camera...');
      await startCamera();

      setStatus('Position your face within the oval frame');
      setIsLoading(false);

      startScanning();
    } catch (err: any) {
      console.error('Initialization error:', err);
      setError(err.message || 'Failed to initialize face recognition');
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });
      }

      setStream(mediaStream);
    } catch (err: any) {
      console.error('Camera error:', err);
      throw new Error('Unable to access camera. Please grant camera permissions.');
    }
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setScanTime(0);

    timerIntervalRef.current = setInterval(() => {
      setScanTime(prev => {
        const newTime = prev + 1;
        if (newTime >= MAX_SCAN_TIME) {
          handleAutoRegistration();
          return newTime;
        }
        return newTime;
      });
    }, 1000);

    scanIntervalRef.current = setInterval(async () => {
      await scanForFace();
    }, 1500);
  };

  const scanForFace = async () => {
    if (!videoRef.current || isLoading || showRegistrationForm) return;

    try {
      if (users.length > 0) {
        const recognizedUser = await recognizeFace(videoRef.current, users);

        if (recognizedUser) {
          console.log('Face recognized during login:', {
            userId: recognizedUser.id,
            userName: recognizedUser.name,
            userEmail: recognizedUser.email,
            timestamp: new Date().toISOString()
          });
          setStatus(`Welcome back, ${recognizedUser.name}!`);
          cleanup();
          
          setTimeout(() => {
            onSuccess(recognizedUser);
          }, 1000);
        }
      }
    } catch (err: any) {
      console.error('Scan error:', err);
    }
  };

  const handleAutoRegistration = async () => {
    if (showRegistrationForm || !videoRef.current) return;

    cleanup();
    setStatus('Face not recognized. Registering your face...');
    setIsProcessing(true);

    try {
      const detection = await detectSingleFace(videoRef.current);
      
      if (!detection) {
        setError('No face detected. Please try again.');
        setIsProcessing(false);
        startScanning();
        return;
      }

      const descriptor = getFaceDescriptor(detection);
      const descriptorString = descriptorToString(descriptor);
      const imageUrl = await captureFaceImage(videoRef.current);

      console.log('Face captured during registration:', {
        faceDataLength: descriptorString.length,
        hasImage: !!imageUrl,
        timestamp: new Date().toISOString()
      });

      setCapturedFaceData(descriptorString);
      setCapturedFaceImage(imageUrl);
      setShowRegistrationForm(true);
      setIsProcessing(false);
      setStatus('Face captured! Please enter your details.');
    } catch (error: any) {
      console.error('Face capture error:', error);
      setError(error.message || 'Failed to capture face. Please try again.');
      setIsProcessing(false);
      startScanning();
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const userId = await registerUser({
        name: formData.name,
        email: formData.email,
        phone: '',
        faceData: capturedFaceData,
        faceImageUrl: capturedFaceImage,
      });

      const newUser: User = {
        id: userId,
        name: formData.name,
        email: formData.email,
        phone: '',
        faceData: capturedFaceData,
        faceImageUrl: capturedFaceImage,
        registeredAt: Timestamp.now(),
      };

      console.log('User registration completed:', {
        userId: newUser.id,
        userName: newUser.name,
        userEmail: newUser.email,
        hasFaceData: !!capturedFaceData,
        hasFaceImage: !!capturedFaceImage,
        timestamp: new Date().toISOString()
      });

      setStatus('Registration successful!');
      setTimeout(() => {
        onSuccess(newUser);
      }, 1000);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSkipFaceScan = () => {
    cleanup();
    setShowRegistrationForm(true);
    setStatus('Enter your details to continue');
  };

  const handleEmailLogin = () => {
    alert('Email login coming soon!');
  };

  const handleGoogleLogin = () => {
    alert('Google login coming soon!');
  };

  const handleClose = () => {
    cleanup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <img 
          src="/logo.png" 
          alt="FaceFlow Logo" 
          className="h-20 w-auto object-contain"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {showRegistrationForm ? 'Complete Registration' : 'Scan Your Face'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showRegistrationForm ? (
            <>
              {/* Camera View */}
              <div className="relative w-full aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Face Oval Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img 
                    src="/face.png" 
                    alt="Face alignment guide" 
                    className="w-64 h-64 object-contain opacity-80"
                  />
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-2" />
                      <p className="text-white text-xs">{scanStatus}</p>
                    </div>
                  </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">{scanStatus}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Text */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">{scanStatus}</p>
                <p className="text-xs text-gray-500">
                  Make sure your face is well-lit and centered
                </p>
                {scanTime > 0 && scanTime < MAX_SCAN_TIME && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    Scanning... {MAX_SCAN_TIME - scanTime}s remaining
                  </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSkipFaceScan}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Capture Face
                </button>

                <button
                  onClick={handleEmailLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Continue with Email
                </button>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </button>

                <button
                  onClick={handleSkipFaceScan}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
                >
                  Skip Face Scan
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Registration Form */}
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                  {capturedFaceImage ? (
                    <img src={capturedFaceImage} alt="Your face" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-center text-gray-600 text-sm mb-6">
                  {capturedFaceData ? 'Face captured successfully!' : 'Almost there!'} Please complete your profile.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
