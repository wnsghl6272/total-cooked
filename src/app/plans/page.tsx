import React from 'react';
import Navbar from '@/components/Navbar';

export default function PlansPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Plans</h1>
          <p className="text-lg text-gray-600">
            Our subscription plans will be available soon. Stay tuned for exciting cooking experiences!
          </p>
        </div>
      </div>
    </>
  );
} 