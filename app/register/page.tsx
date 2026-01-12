'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Camera from '@/components/Camera';
import { registerUser } from '@/lib/userService';
import { loadFaceRecognitionModels, detectSingleFace, getFaceDescriptor, descriptorToString, captureFaceSnapshot } from '@/lib/faceRecognition';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'camera' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [faceData, setFaceData] = useState<string>('');
  const [faceSnapshot, setFaceSnapshot] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [modelLoaded, setModelLoaded] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      setStep('camera');
      setIsCameraActive(true);
      loadModel();
    }
  };

  const loadModel = async () => {
    try {
      await loadFaceRecognitionModels();
      setModelLoaded(true);
    } catch (err) {
      setError('Failed to load face recognition models');
      console.error(err);
    }
  };

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    setError('');

    try {
      const video = document.querySelector('video');
      if (!video) {
        throw new Error('Video element not found');
      }

      const detection = await detectSingleFace(video);
      
      if (!detection) {
        setError('No face detected. Please ensure your face is clearly visible and try again.');
        setIsProcessing(false);
        return;
      }

      const descriptor = getFaceDescriptor(detection);
      
      if (!descriptor) {
        throw new Error('Failed to extract face descriptor');
      }

      const descriptorString = descriptorToString(descriptor);
      const snapshotImage = captureFaceSnapshot(video, detection);
      
      setFaceData(descriptorString);
      setFaceSnapshot(snapshotImage);
      
      await registerUser({
        ...formData,
        faceData: descriptorString,
        faceImageUrl: snapshotImage,
      });

      setIsCameraActive(false);
      setStep('success');
    } catch (err) {
      setError('Failed to register user. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Customer</h1>
          <p className="text-gray-600 mb-8">Add a new customer to your recognition database</p>

          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-black"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-black"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-black"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue to Face Scan
              </button>
            </form>
          )}

          {step === 'camera' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Instructions:</strong> Position your face in the center of the frame. 
                  Make sure you&apos;re in a well-lit area and looking directly at the camera.
                </p>
              </div>

              {!modelLoaded && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading face detection model...</p>
                </div>
              )}

              {modelLoaded && (
                <Camera
                  onCapture={handleCapture}
                  isActive={isCameraActive}
                  showOverlay={true}
                  isProcessing={isProcessing}
                />
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Processing face data...</p>
                </div>
              )}

              <button
                onClick={() => {
                  setStep('form');
                  setIsCameraActive(false);
                  setError('');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                Back to Form
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Registration Successful!
              </h2>
              
              {faceSnapshot && (
                <div className="mb-6">
                  <img 
                    src={faceSnapshot} 
                    alt="Face snapshot" 
                    className="w-32 h-32 rounded-full mx-auto border-4 border-green-500 object-cover shadow-lg"
                  />
                </div>
              )}
              
              <p className="text-gray-600 mb-2 font-semibold text-lg">
                {formData.name}
              </p>
              <p className="text-gray-500 mb-8 text-sm">
                has been successfully registered in the system.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setStep('form');
                    setFormData({ name: '', email: '', phone: '' });
                    setFaceData('');
                    setFaceSnapshot('');
                    setError('');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Register Another Customer
                </button>
                <Link
                  href="/greet"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Go to Greet Mode
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
