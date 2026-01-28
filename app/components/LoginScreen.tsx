import { UserCircle, Scan, Mail } from 'lucide-react';

interface LoginScreenProps {
  onContinueAsGuest: () => void;
  onRegister: () => void;
  onFirebaseLogin: () => void;
}

export function LoginScreen({ onContinueAsGuest, onRegister, onFirebaseLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-600 rounded-full mb-4">
            <span className="text-4xl">☕</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coffee Shop POS
          </h1>
          <p className="text-gray-600">
            Welcome! Please choose how to continue
          </p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* Firebase Login */}
          <button
            onClick={onFirebaseLogin}
            className="w-full bg-white rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Sign In with Email
                </h3>
                <p className="text-sm text-gray-600">
                  Login or create account with email and password
                </p>
              </div>
            </div>
          </button>

          {/* Register with Face */}
          <button
            onClick={onRegister}
            className="w-full bg-white rounded-2xl p-6 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors flex-shrink-0">
                <Scan className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Register with Face
                </h3>
                <p className="text-sm text-gray-600">
                  Scan your face to create an account and enjoy personalized service
                </p>
              </div>
            </div>
          </button>

          {/* Continue as Guest */}
          <button
            onClick={onContinueAsGuest}
            className="w-full bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                <UserCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Continue as Guest
                </h3>
                <p className="text-sm text-gray-600">
                  Quick checkout without registration
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Your face data is stored securely and never shared
        </p>
      </div>
    </div>
  );
}
