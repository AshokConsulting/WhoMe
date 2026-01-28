'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, UserPlus, Users } from "lucide-react";
import { recognizeFace } from '@/lib/faceRecognition';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [recognizing, setRecognizing] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scanAttemptsRef = useRef(0);
  const MAX_SCAN_ATTEMPTS = 10;

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        startFaceRecognition();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please allow camera permissions.');
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
        
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          console.log('Video not ready yet');
          return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg');
          
          setRecognizing(true);
          scanAttemptsRef.current += 1;
          setScanAttempts(scanAttemptsRef.current);
          
          try {
            console.log(`Recognition attempt ${scanAttemptsRef.current}/${MAX_SCAN_ATTEMPTS}`);
            const result = await recognizeFace(imageData);
            if (result) {
              console.log('Face recognized successfully:', result);
              setIsScanning(false);
              stopCamera();
              router.push(`/menu?userId=${result.id}&userName=${encodeURIComponent(result.name)}`);
              return;
            }
            
            console.log(`Face not recognized, attempt ${scanAttemptsRef.current}/${MAX_SCAN_ATTEMPTS}`);
            if (scanAttemptsRef.current >= MAX_SCAN_ATTEMPTS) {
              console.log('Max attempts reached, redirecting to registration');
              setIsScanning(false);
              stopCamera();
              localStorage.setItem('capturedFaceImage', imageData);
              router.push('/register?autoCapture=true');
            }
          } catch (error) {
            console.error('Recognition error:', error);
          } finally {
            setRecognizing(false);
          }
        }
      }
    }, 2000);
  };

  const handleContinueAsGuest = () => {
    stopCamera();
    router.push('/menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Coffee Shop POS
          </h1>
          <p className="text-xl text-blue-100">
            Position your face in the circle for recognition
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div className="w-80 h-80 border-4 border-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-blue-400 opacity-50" />
                </div>
              </div>
            </div>

            {recognizing && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-400 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Recognizing... ({scanAttempts}/{MAX_SCAN_ATTEMPTS})
                </div>
              </div>
            )}
            
            {scanAttempts > 5 && scanAttempts < MAX_SCAN_ATTEMPTS && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
                Not recognized? We'll help you register in {MAX_SCAN_ATTEMPTS - scanAttempts} seconds...
              </div>
            )}
          </div>

          <div className="p-8 space-y-10">
            <p className="text-center text-gray-600 mb-6">
              Center your face in the circle. We'll recognize you automatically!
            </p>

            <Link href="/register">
              <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 font-semibold text-lg shadow-lg">
                <UserPlus className="w-6 h-6" />
                Register Now
              </button>
            </Link>

            <button
              onClick={handleContinueAsGuest}
              className="w-full bg-gray-600 text-white py-4 px-6 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-3 font-semibold text-lg shadow-lg"
            >
              <Users className="w-6 h-6" />
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
