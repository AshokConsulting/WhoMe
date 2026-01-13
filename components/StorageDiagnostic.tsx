'use client';

import { useState } from 'react';
import { checkStorageConfiguration } from '@/lib/storageCheck';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function StorageDiagnostic() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const runCheck = async () => {
    setChecking(true);
    try {
      const checkResult = await checkStorageConfiguration();
      setResult(checkResult);
    } catch (error) {
      console.error('Diagnostic error:', error);
      setResult({ error: 'Failed to run diagnostic' });
    } finally {
      setChecking(false);
    }
  };

  if (!showDiagnostic) {
    return (
      <button
        onClick={() => setShowDiagnostic(true)}
        className="text-sm text-gray-600 hover:text-gray-800 underline"
      >
        Having issues with image uploads? Click here
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900">Firebase Storage Diagnostic</h3>
        <button
          onClick={() => setShowDiagnostic(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {!result ? (
        <div>
          <p className="text-gray-600 mb-4">
            This will test if Firebase Storage is properly configured for uploading menu images.
          </p>
          <button
            onClick={runCheck}
            disabled={checking}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {checking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Run Diagnostic'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {result.isConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">Storage Bucket</p>
              <p className="text-sm text-gray-600">
                {result.bucketName || 'Not configured'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {result.canUpload ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">Upload Permission</p>
              <p className="text-sm text-gray-600">
                {result.canUpload ? 'Working' : 'Failed'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {result.canRead ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">Read Permission</p>
              <p className="text-sm text-gray-600">
                {result.canRead ? 'Working' : 'Failed'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {result.canDelete ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">Delete Permission</p>
              <p className="text-sm text-gray-600">
                {result.canDelete ? 'Working' : 'Failed'}
              </p>
            </div>
          </div>

          {result.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error Details</p>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              </div>
            </div>
          )}

          {!result.isConfigured || !result.canUpload ? (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-yellow-900 mb-2">Setup Required</p>
              <p className="text-sm text-yellow-800 mb-3">
                Firebase Storage needs to be enabled and configured. Follow these steps:
              </p>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Go to Firebase Console</li>
                <li>Enable Storage for your project</li>
                <li>Set up Storage security rules</li>
                <li>Verify storage bucket name in .env.local</li>
              </ol>
              <p className="text-sm text-yellow-800 mt-3">
                📖 See <code className="bg-yellow-100 px-1 py-0.5 rounded">MENU_STORAGE_SETUP.md</code> for detailed instructions
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Storage is Working!</p>
                  <p className="text-sm text-green-700">
                    Firebase Storage is properly configured. You can upload menu images.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={runCheck}
            disabled={checking}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Run diagnostic again
          </button>
        </div>
      )}
    </div>
  );
}
