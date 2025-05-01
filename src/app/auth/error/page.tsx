'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 text-gray-600">
            <p>Sorry, there was a problem authenticating your account.</p>
            {errorMessage && (
              <p className="mt-2 text-sm text-red-600">
                Error: {errorMessage}
              </p>
            )}
          </div>
        </div>
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-grapefruit hover:bg-grapefruit-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grapefruit"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 