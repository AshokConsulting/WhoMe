'use client';

import { useState, useEffect, useRef } from 'react';
import Camera from '@/components/Camera';
import { getAllUsers, User, deleteUser } from '@/lib/userService';
import { loadFaceRecognitionModels, detectSingleFace, getFaceDescriptor, stringToDescriptor, compareFaceDescriptors } from '@/lib/faceRecognition';
import { ArrowLeft, UserCheck, Users, Trash2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function GreetPage() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [recognizedUser, setRecognizedUser] = useState<User | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGreetedRef = useRef<string>('');
  const greetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUsers();
    loadModel();
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (greetTimeoutRef.current) {
        clearTimeout(greetTimeoutRef.current);
      }
    };
  }, []);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Failed to load users from database');
      console.error(err);
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

  const startScanning = () => {
    setIsCameraActive(true);
    setIsScanning(true);
    
    scanIntervalRef.current = setInterval(async () => {
      await scanForFaces();
    }, 2000);
  };

  const stopScanning = () => {
    setIsCameraActive(false);
    setIsScanning(false);
    setRecognizedUser(null);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (greetTimeoutRef.current) {
      clearTimeout(greetTimeoutRef.current);
      greetTimeoutRef.current = null;
    }
  };

  const scanForFaces = async () => {
    try {
      const video = document.querySelector('video');
      if (!video || !modelLoaded) return;

      const detection = await detectSingleFace(video);
      
      if (!detection) {
        if (recognizedUser && lastGreetedRef.current) {
          if (greetTimeoutRef.current) {
            clearTimeout(greetTimeoutRef.current);
          }
          greetTimeoutRef.current = setTimeout(() => {
            setRecognizedUser(null);
            lastGreetedRef.current = '';
          }, 3000);
        }
        return;
      }

      const currentDescriptor = getFaceDescriptor(detection);
      
      if (!currentDescriptor) return;

      let bestMatch: { user: User; similarity: number } | null = null;

      for (const user of users) {
        try {
          const storedDescriptor = stringToDescriptor(user.faceData);
          const similarity = await compareFaceDescriptors(currentDescriptor, storedDescriptor);
          
          if (similarity > 0.6 && (!bestMatch || similarity > bestMatch.similarity)) {
            bestMatch = { user, similarity };
          }
        } catch (err) {
          console.error('Error comparing with user:', user.name, err);
        }
      }

      if (bestMatch) {
        if (lastGreetedRef.current !== bestMatch.user.id) {
          setRecognizedUser(bestMatch.user);
          lastGreetedRef.current = bestMatch.user.id || '';
          
          if (greetTimeoutRef.current) {
            clearTimeout(greetTimeoutRef.current);
          }
        }
      } else {
        if (recognizedUser && lastGreetedRef.current) {
          if (greetTimeoutRef.current) {
            clearTimeout(greetTimeoutRef.current);
          }
          greetTimeoutRef.current = setTimeout(() => {
            setRecognizedUser(null);
            lastGreetedRef.current = '';
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Face scanning error:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(userId);
      
      if (recognizedUser?.id === userId) {
        setRecognizedUser(null);
        lastGreetedRef.current = '';
      }
      
      await loadUsers();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-800 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Greet Mode</h1>
              <p className="text-gray-600 mb-8">Automatically recognize and greet your customers</p>

              {!modelLoaded && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading face detection model...</p>
                </div>
              )}

              {modelLoaded && (
                <>
                  <Camera
                    isActive={isCameraActive}
                    showOverlay={isScanning}
                  />

                  <div className="mt-6 flex gap-4">
                    {!isScanning ? (
                      <button
                        onClick={startScanning}
                        disabled={users.length === 0}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Start Scanning
                      </button>
                    ) : (
                      <button
                        onClick={stopScanning}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Stop Scanning
                      </button>
                    )}
                  </div>

                  {users.length === 0 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        No registered users found. Please register customers first.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {recognizedUser && (
              <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <UserCheck className="w-12 h-12" />
                  <div>
                    <h2 className="text-3xl font-bold">Welcome Back!</h2>
                    <p className="text-green-100">Customer Recognized</p>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-4xl font-bold mb-2">{recognizedUser.name}</h3>
                  <p className="text-lg text-green-100">{recognizedUser.email}</p>
                  <p className="text-lg text-green-100">{recognizedUser.phone}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Registered Customers</h2>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-green-600">{users.length}</div>
                <p className="text-gray-600 text-sm">Total Customers</p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      recognizedUser?.id === user.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {deleteConfirm === user.id ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-900">
                          Delete {user.name}?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteUser(user.id!)}
                            disabled={isDeleting}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-semibold py-2 px-3 rounded transition-colors"
                          >
                            {isDeleting ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            disabled={isDeleting}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 text-sm font-semibold py-2 px-3 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        {user.faceImageUrl && (
                          <img
                            src={user.faceImageUrl}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(user.id!)}
                          disabled={isScanning}
                          className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">No customers registered yet</p>
                  <Link
                    href="/register"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    Register First Customer
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
