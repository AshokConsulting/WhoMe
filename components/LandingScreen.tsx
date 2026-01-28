import { useState, useEffect, useRef } from 'react';
import { Camera, User, CheckCircle, XCircle } from "lucide-react";
import { recognizeFace } from '../lib/faceRecognition';
import type { User as FaceUser } from '../lib/userService';

interface LandingScreenProps {
  onSuccess: (user: FaceUser) => void;
}

export function LandingScreen({ onSuccess }: LandingScreenProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [recognizing, setRecognizing] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [status, setStatus] = useState('Initializing...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_SCAN_ATTEMPTS = 5;

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setStatus('Accessing camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStatus('Camera ready. Starting face recognition...');
        startFaceRecognition();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setStatus('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startFaceRecognition = () => {
    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current && isScanning && !recognizing) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg');
          
          setRecognizing(true);
          const newAttemptCount = scanAttempts + 1;
          setScanAttempts(newAttemptCount);
          setStatus(`Scanning attempt ${newAttemptCount}/${MAX_SCAN_ATTEMPTS}...`);
          
          try {
            console.log(`🔍 Face recognition attempt ${newAttemptCount}`);
            const result = await recognizeFace(imageData);
            
            if (result) {
              console.log('✅ FACE RECOGNIZED:', result);
              setIsScanning(false);
              stopCamera();
              setRecognitionResult(result);
              setStatus(`✅ Face recognized! Welcome, ${result.name}!`);
              
              // Convert to proper User interface
              const user: FaceUser = {
                id: result.id,
                name: result.name,
                email: result.email,
                phone: '', // Default empty phone
                faceData: '', // Default empty faceData
                registeredAt: new Date() as any, // Current time as Timestamp
              };
              
              // Call success callback after a short delay
              setTimeout(() => {
                onSuccess(user);
              }, 1500);
              return;
            }
            
            if (newAttemptCount >= MAX_SCAN_ATTEMPTS) {
              setIsScanning(false);
              stopCamera();
              setStatus(`❌ Face not recognized after ${MAX_SCAN_ATTEMPTS} attempts. Please try again or register a new face.`);
            }
          } catch (error) {
            console.error('Recognition error:', error);
            setStatus('Recognition error. Retrying...');
          } finally {
            setRecognizing(false);
          }
        }
      }
    }, 2000);
  };

  const handleReset = () => {
    setRecognitionResult(null);
    setScanAttempts(0);
    setIsScanning(true);
    setStatus('Restarting face recognition...');
    startCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-700 via-orange-600 to-amber-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-white text-8xl font-bold">☕</div>
            <div className="text-white text-6xl font-bold opacity-80">FaceFlow</div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">
            Coffee
          </h1>
          <p className="text-2xl text-amber-100 font-light">
            Your personalized coffee experience starts here
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-200">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-sm">AI-Powered Face Recognition</span>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg bg-opacity-95">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Face overlay with 30% transparency */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div className="w-80 h-80 border-4 border-amber-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/face.png" 
                    alt="Face overlay"
                    className="w-32 h-32 object-cover opacity-30"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <Camera className="w-16 h-16 text-amber-400 opacity-50 absolute" />
                </div>
              </div>
            </div>

            {recognizing && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scanning... ({scanAttempts}/{MAX_SCAN_ATTEMPTS})
                </div>
              </div>
            )}
          </div>

          <div className="p-8 space-y-6 bg-gradient-to-b from-amber-50 to-white">
            {/* Status Display */}
            <div className="text-center">
              <div className={`text-xl font-semibold mb-4 ${
                recognitionResult ? 'text-green-600' : 
                status.includes('❌') ? 'text-red-600' : 
                'text-amber-700'
              }`}>
                {status}
              </div>
              
              {recognitionResult && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-4 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-green-800 font-bold text-lg">Welcome back, {recognitionResult.name}!</span>
                  </div>
                  <div className="text-sm text-green-700">
                    Preparing your personalized coffee experience...
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!isScanning && (
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3 font-semibold shadow-lg"
                >
                  <Camera className="w-6 h-6" />
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
