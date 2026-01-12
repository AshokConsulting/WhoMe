'use client';

import { useRef, useEffect, useState } from 'react';
import { Camera as CameraIcon, CameraOff } from 'lucide-react';

interface CameraProps {
  onCapture?: (imageData: string) => void;
  isActive: boolean;
  onFaceDetected?: (faceData: string) => void;
  showOverlay?: boolean;
  isProcessing?: boolean;
}

export default function Camera({ onCapture, isActive, onFaceDetected, showOverlay = false, isProcessing = false }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError('');
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        if (onCapture) {
          onCapture(imageData);
        }
      }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        {error ? (
          <div className="flex items-center justify-center h-96 bg-gray-800">
            <div className="text-center p-6">
              <CameraOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-white">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
            {showOverlay && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-4 border-green-500/30 rounded-lg m-8"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-64 h-64 border-4 border-green-500 rounded-full opacity-50"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {onCapture && isActive && !error && (
        <button
          onClick={captureImage}
          disabled={isProcessing}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <CameraIcon className="w-5 h-5" />
          {isProcessing ? 'Processing...' : 'Capture Face'}
        </button>
      )}
      
      {!isActive && videoRef.current && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <CameraOff className="w-16 h-16 text-white" />
        </div>
      )}
    </div>
  );
}
