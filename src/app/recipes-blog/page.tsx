import React from 'react';
import Navbar from '@/components/Navbar';

export default function RecipesBlogPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Recipes Blog</h1>
          <p className="text-lg text-gray-600 mb-8">
            Discover our latest recipes, cooking tips, and culinary inspiration.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blog post placeholders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
              <p className="text-gray-600">
                Our blog posts will be available soon. Check back for delicious recipes and cooking tips!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 