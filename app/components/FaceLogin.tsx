import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, AlertCircle, UserCheck, Chrome, UserCircle } from 'lucide-react';
import { loadFaceRecognitionModels, recognizeFace } from '../lib/faceRecognition';
import { getAllUsers, User } from '../lib/userService';

interface FaceLoginProps {
  onSuccess: (user: User) => void;
  onRegisterRedirect: () => void;
  onSkip: () => void;
}

export function FaceLogin({ onSuccess, onRegisterRedirect, onSkip }: FaceLoginProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [scanStatus, setStatus] = useState<string>('Initializing camera...');
  const [scanAttempts, setScanAttempts] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_SCAN_ATTEMPTS = 10;
  const SCAN_INTERVAL = 2000;

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

      if (allUsers.length === 0) {
        setError('No registered users found. Please register first.');
        setIsLoading(false);
        setTimeout(() => {
          onRegisterRedirect();
        }, 2000);
        return;
      }

      setStatus('Starting camera...');
      await startCamera();

      setStatus('Ready to scan. Please look at the camera...');
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

    scanIntervalRef.current = setInterval(async () => {
      await scanForFace();
    }, SCAN_INTERVAL);
  };

  const scanForFace = async () => {
    if (!videoRef.current || isLoading) return;

    try {
      setScanAttempts(prev => {
        const newAttempts = prev + 1;
        
        if (newAttempts >= MAX_SCAN_ATTEMPTS) {
          setStatus('No face recognized. Redirecting to registration...');
          cleanup();
          setTimeout(() => {
            onRegisterRedirect();
          }, 2000);
          return newAttempts;
        }

        setStatus(`Scanning... (Attempt ${newAttempts}/${MAX_SCAN_ATTEMPTS})`);
        return newAttempts;
      });

      const recognizedUser = await recognizeFace(videoRef.current, users);

      if (recognizedUser) {
        setStatus(`Welcome back, ${recognizedUser.name}!`);
        cleanup();
        
        setTimeout(() => {
          onSuccess(recognizedUser);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Position your face in the circle for recognition</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Camera View with Face.png Overlay */}
          <div className="relative w-full aspect-[3/4] max-w-xs mx-auto bg-gray-900 rounded-xl overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Face.png Overlay */}
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

            {/* Scanning Status */}
            {!isLoading && !error && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    {scanAttempts < MAX_SCAN_ATTEMPTS ? (
                      <>
                        <Camera className="w-4 h-4 text-green-400 animate-pulse flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{scanStatus}</p>
                          <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-green-400 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${(scanAttempts / MAX_SCAN_ATTEMPTS) * 100}%` }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <p className="text-white text-xs font-medium">{scanStatus}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons Below Camera */}
          <div className="space-y-3">
            <button
              onClick={onSkip}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>

            <button
              onClick={onSkip}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <UserCircle className="w-5 h-5" />
              Continue as Guest
            </button>

            <button
              onClick={onRegisterRedirect}
              className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
            >
              New user? Register here
            </button>
          </div>

          {/* Bottom Text */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Center your face in the circle. We'll recognize you automatically!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
