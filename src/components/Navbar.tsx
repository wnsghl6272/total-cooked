'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      router.refresh(); // Refresh the current page
      router.push('/'); // Redirect to home page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/mainlogo.png"
              alt="TotallyCooked Logo"
              width={280}
              height={70}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Navigation Menu and Auth Buttons */}
          <div className="flex items-center space-x-8">
            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/cook" 
                className={`text-gray-600 hover:text-grapefruit relative group ${pathname === '/cook' ? 'text-grapefruit' : ''}`}
              >
                Find Recipe
                {pathname === '/cook' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-grapefruit"></span>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-grapefruit transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/plans" className="text-gray-600 hover:text-grapefruit">
                Plans
              </Link>
              <Link href="/recipes-blog" className="text-gray-600 hover:text-grapefruit">
                Recipes Blog
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-grapefruit">
                Contact us
              </Link>
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-grapefruit focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-grapefruit-light flex items-center justify-center">
                      <span className="text-grapefruit font-medium">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-grapefruit text-white px-4 py-2 rounded-lg hover:bg-grapefruit-dark transition-colors"
                >
                  Sign in
                </Link>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden ml-4 text-gray-600 hover:text-grapefruit focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/cook"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/cook'
                    ? 'text-grapefruit bg-grapefruit/5'
                    : 'text-gray-700 hover:text-grapefruit hover:bg-gray-50'
                }`}
              >
                Find Recipe
              </Link>
              <Link
                href="/plans"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-grapefruit hover:bg-gray-50"
              >
                Plans
              </Link>
              <Link
                href="/recipes-blog"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-grapefruit hover:bg-gray-50"
              >
                Recipes Blog
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-grapefruit hover:bg-gray-50"
              >
                Contact us
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 