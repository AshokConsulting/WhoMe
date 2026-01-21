import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle, X, Loader, AlertCircle } from 'lucide-react';
import { loadFaceRecognitionModels, detectSingleFace, getFaceDescriptor, descriptorToString, captureFaceImage } from '../lib/faceRecognition';
import { registerUser } from '../lib/userService';

interface FaceRegistrationProps {
  onComplete: (userData: { name: string; phone: string; email: string }) => void;
  onCancel: () => void;
}

export function FaceRegistration({ onComplete, onCancel }: FaceRegistrationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState<'camera' | 'scanning' | 'details'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [faceData, setFaceData] = useState<string>('');
  const [faceImageUrl, setFaceImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    initializeModels();
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const initializeModels = async () => {
    try {
      await loadFaceRecognitionModels();
    } catch (error) {
      console.error('Failed to load face recognition models:', error);
      setCameraError('Failed to load face recognition models. Please refresh the page.');
    }
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please allow camera permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleScanFace = async () => {
    if (!stream || !videoRef.current) {
      setCameraError('Camera not available. Please enable camera access.');
      return;
    }
    
    setStep('scanning');
    setIsProcessing(true);
    setCameraError('');

    try {
      const detection = await detectSingleFace(videoRef.current);
      
      if (!detection) {
        setCameraError('No face detected. Please ensure your face is clearly visible and try again.');
        setStep('camera');
        setIsProcessing(false);
        return;
      }

      const descriptor = getFaceDescriptor(detection);
      const descriptorString = descriptorToString(descriptor);
      const imageUrl = await captureFaceImage(videoRef.current);

      setFaceData(descriptorString);
      setFaceImageUrl(imageUrl);
      
      stopCamera();
      setStep('details');
    } catch (error: any) {
      console.error('Face scanning error:', error);
      setCameraError(error.message || 'Failed to scan face. Please try again.');
      setStep('camera');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipCamera = () => {
    stopCamera();
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCameraError('');

    try {
      if (faceData) {
        await registerUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          faceData: faceData,
          faceImageUrl: faceImageUrl,
        });
      }
      
      onComplete(formData);
    } catch (error: any) {
      console.error('Registration error:', error);
      setCameraError(error.message || 'Failed to register user. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'camera' && 'Scan Your Face'}
            {step === 'scanning' && 'Scanning Face...'}
            {step === 'details' && 'Complete Registration'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Camera View */}
          {step === 'camera' && (
            <div>
              <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Face outline overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <div className="w-48 h-64 border-4 border-amber-500 rounded-full opacity-70"></div>
                    {/* Corner markers */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-1 h-8 bg-amber-400"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1 h-8 bg-amber-400"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 h-1 w-8 bg-amber-400"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 h-1 w-8 bg-amber-400"></div>
                  </div>
                </div>
                {/* Scanning line animation */}
                {stream && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-1 bg-amber-400 opacity-60 animate-pulse"></div>
                  </div>
                )}
              </div>
              
              {cameraError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="text-sm text-red-600 underline hover:text-red-700 mt-1"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {stream ? 'Position your face within the oval frame' : 'Requesting camera access...'}
                </p>
                <p className="text-xs text-gray-500">
                  Make sure your face is well-lit and centered
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleScanFace}
                  disabled={!stream || isProcessing}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Capture Face
                    </>
                  )}
                </button>
                <button
                  onClick={handleSkipCamera}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors text-sm"
                >
                  Skip Face Scan
                </button>
              </div>
            </div>
          )}

          {/* Scanning */}
          {step === 'scanning' && (
            <div className="py-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 border-4 border-amber-200 rounded-full"></div>
                  <div className="absolute inset-0 w-24 h-24 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-amber-600" />
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Processing facial recognition...
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Analyzing biometric features
                </p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-amber-600 animate-pulse" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Details Form */}
          {step === 'details' && (
            <div>
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <p className="text-center text-gray-600 mb-6">
                {faceData ? 'Face captured successfully!' : 'Almost there!'} Please complete your profile.
              </p>
              {cameraError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{cameraError}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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
                      <Loader className="w-5 h-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}