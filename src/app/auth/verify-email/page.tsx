'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmail() {
  const [email, setEmail] = useState<string>('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already verified, redirect to home
    if (user?.email_confirmed_at) {
      router.push('/');
    }
    // Set the email from the user context
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <div className="mt-4 text-gray-600">
            <p>We sent a verification link to</p>
            <p className="font-medium text-grapefruit">{email}</p>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-500">
            Click the link in the email to verify your account. If you don't see the email, check your spam folder.
          </p>
          <div className="animate-pulse flex justify-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-grapefruit rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500">
            You can close this page after verifying your email.
          </p>
        </div>
      </div>
    </div>
  );
} 