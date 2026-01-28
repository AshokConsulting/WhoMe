import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, AlertCircle, X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { loadFaceRecognitionModels, detectSingleFace, getFaceDescriptor, descriptorToString, captureFaceImage, recognizeFace } from '@/lib/faceRecognition';
import { getAllUsers, User, registerUser } from '@/lib/userService';

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
    console.log('🏗️ LandingScreen component mounting...');
    initializeFaceRecognition();

    return () => {
      console.log('🏗️ LandingScreen component unmounting...');
      cleanup();
    };
  }, []);

  useEffect(() => {
    console.log('🔄 isLoading state changed:', { isLoading, timestamp: new Date().toISOString() });
  }, [isLoading]);

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
      console.log('🚀 Initializing face recognition system...');
      setStatus('Loading face recognition models...');
      await loadFaceRecognitionModels();
      console.log('✅ Face recognition models loaded');
      
      setStatus('Loading registered users...');
      const allUsers = await getAllUsers();
      console.log('👥 Users loaded from database:', {
        totalUsers: allUsers.length,
        usersWithFaceData: allUsers.filter(u => !!u.faceData).length,
        userDetails: allUsers.map(u => ({ id: u.id, name: u.name, hasFaceData: !!u.faceData }))
      });
      setUsers(allUsers);
      
      const cameraStream = await startCamera();
      setStream(cameraStream);
      console.log('📷 Camera setup complete');
      
      setStatus('Position your face in the oval');
      console.log('🔄 Setting isLoading to false...');
      setIsLoading(false);
      
      console.log('🔍 Starting face scanning...');
      startScanning();
    } catch (err: any) {
      console.error('🚨 INITIALIZATION ERROR:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      setError(err.message || 'Failed to initialize face recognition');
      setIsLoading(false);
    }
  };

  const startCamera = async (): Promise<MediaStream> => {
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
      return mediaStream;
    } catch (err: any) {
      console.error('Camera error:', err);
      throw new Error('Unable to access camera. Please grant camera permissions.');
    }
  };

  const startScanning = () => {
    console.log('🔧 Setting up scanning intervals...');
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      console.log('🧹 Cleared previous scan interval');
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      console.log('🧹 Cleared previous timer interval');
    }

    setScanTime(0);

    console.log('⏰ Setting up timer interval (1 second)...');
    timerIntervalRef.current = setInterval(() => {
      setScanTime(prev => {
        const newTime = prev + 1;
        console.log(`⏱️ Timer tick: ${newTime}s`);
        if (newTime >= MAX_SCAN_TIME) {
          console.log('⏰ Timer reached max, triggering auto-registration');
          handleAutoRegistration();
          return newTime;
        }
        return newTime;
      });
    }, 1000);

    console.log('🔍 Setting up scan interval (1.5 seconds)...');
    scanIntervalRef.current = setInterval(async () => {
      console.log('📞 Scan interval triggered, calling scanForFace...');
      await scanForFace();
    }, 1500);
    
    console.log('✅ Scanning intervals setup complete');
  };

  const scanForFace = async () => {
    console.log('🔍 scanForFace called:', {
      hasVideoRef: !!videoRef.current,
      isLoading: isLoading,
      showRegistrationForm: showRegistrationForm,
      shouldReturn: !videoRef.current || isLoading || showRegistrationForm,
      timestamp: new Date().toISOString()
    });

    if (!videoRef.current || isLoading || showRegistrationForm) {
      console.log('❌ scanForFace blocked by guard clause:', {
        noVideoRef: !videoRef.current,
        isLoading: isLoading,
        showRegistrationForm: showRegistrationForm
      });
      return;
    }

    try {
      console.log('🔍 Starting face scan attempt...', {
        usersAvailable: users.length,
        scanTime: scanTime,
        timestamp: new Date().toISOString()
      });

      if (users.length > 0) {
        console.log('👥 Available users for recognition:', users.map(u => ({ id: u.id, name: u.name, hasFaceData: !!u.faceData })));
        
        const recognizedUser = await recognizeFace(videoRef.current, users);

        if (recognizedUser) {
          console.log('✅ FACE RECOGNIZED SUCCESSFULLY:', {
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
        } else {
          console.log('❌ Face not recognized in this scan attempt', {
            scanTime: scanTime,
            timestamp: new Date().toISOString()
          });
          setStatus('Scanning... Position your face in the oval');
        }
      } else {
        console.log('⚠️ No users available for recognition');
        setStatus('No registered users found');
      }
    } catch (err: any) {
      console.error('🚨 SCAN ERROR:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      setStatus('Scan error. Retrying...');
    }
  };

  const handleAutoRegistration = async () => {
    if (showRegistrationForm || !videoRef.current) return;

    console.log('🚀 Starting auto-registration process after 5 seconds of no recognition...');

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setStatus('Face not recognized. Registering your face...');
    setIsProcessing(true);

    try {
      const videoElement = videoRef.current;
      if (!videoElement) {
        console.log('❌ Camera not available for registration');
        setError('Camera not available. Please try again.');
        setIsProcessing(false);
        return;
      }

      console.log('📷 Detecting face for registration...');
      const detection = await detectSingleFace(videoElement);
      
      if (!detection) {
        console.log('❌ No face detected during registration attempt');
        setError('No face detected. Please try again.');
        setIsProcessing(false);
        startScanning();
        return;
      }

      console.log('✅ Face detected for registration');
      const descriptor = getFaceDescriptor(detection);
      if (!descriptor) {
        console.log('❌ Could not extract face descriptor during registration');
        setError('Could not extract face features. Please try again.');
        setIsProcessing(false);
        startScanning();
        return;
      }
      
      const descriptorString = descriptorToString(descriptor);
      console.log('🔢 Face descriptor extracted for registration');
      const imageUrl = await captureFaceImage(videoElement);

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

  const handleClose = () => {
    cleanup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <img 
          src="/logo.png" 
          alt="FaceFlow Logo" 
          className="h-20 w-auto object-contain"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
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

        <div className="p-6">
          {!showRegistrationForm ? (
            <>
              <div className="relative w-full aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img 
                    src="/face.png" 
                    alt="Face alignment guide" 
                    className="w-[320px] h-[320px] object-contain opacity-56"
                  />
                </div>

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-2" />
                      <p className="text-white text-xs">{scanStatus}</p>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">{scanStatus}</p>
                    </div>
                  </div>
                )}
              </div>

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

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleSkipFaceScan}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Skip to Registration
                </button>
              </div>
            </>
          ) : (
            <>
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
