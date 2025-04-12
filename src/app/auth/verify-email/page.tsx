'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyEmail() {
  const [email, setEmail] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already verified, redirect to home
    if (user?.email_confirmed_at) {
      setIsVerified(true);
    }
    // Set the email from the user context
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const checkVerification = async () => {
    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setIsVerified(true);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isVerified ? 'Email Verified!' : 'Check your email'}
          </h2>
          <div className="mt-4 text-gray-600">
            {!isVerified ? (
              <>
                <p>We sent a verification link to your registered email</p>
                <p className="font-medium text-grapefruit">{email}</p>
              </>
            ) : (
              <p className="text-green-600">Your email has been successfully verified!</p>
            )}
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {!isVerified ? (
            <>
              <p className="text-sm text-gray-500">
                Click the link in the email to verify your account. If you don&apos;t see the email, check your spam folder.
              </p>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-grapefruit hover:bg-grapefruit-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grapefruit"
              >
                Go to Login
              </button>
            </>
          ) : (
            <button
              onClick={handleGoHome}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-grapefruit hover:bg-grapefruit-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grapefruit"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 