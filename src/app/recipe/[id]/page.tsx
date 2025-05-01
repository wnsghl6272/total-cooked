'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  image: string;
}

interface Step {
  number: number;
  step: string;
  ingredients?: Ingredient[];
  equipment?: Equipment[];
}

interface Equipment {
  id: number;
  name: string;
  image: string;
}

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  healthScore: number;
  pricePerServing: number;
  summary: string;
  instructions: string;
  analyzedInstructions: { steps: Step[] }[];
  extendedIngredients: Ingredient[];
  missedIngredients?: Ingredient[];
  usedIngredients?: Ingredient[];
  unusedIngredients?: Ingredient[];
}

export default function RecipeDetailPage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'reviews'>('ingredients');
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      user: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely delicious! The flavors were perfect and instructions were easy to follow.",
      date: "2024-03-15"
    },
    {
      id: 2,
      user: "Mike Chen",
      rating: 4,
      comment: "Great recipe, though I added a bit more seasoning to suit my taste.",
      date: "2024-03-14"
    }
  ]);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await fetch(`/api/recipes/${params.id}`);
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRecipeDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-grapefruit border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 text-center">
          <h1 className="text-2xl text-gray-600">Recipe not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{recipe.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.readyInMinutes} minutes
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {recipe.servings} servings
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Health Score: {recipe.healthScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div dangerouslySetInnerHTML={{ __html: recipe.summary }} className="prose max-w-none" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'ingredients'
                ? 'border-b-2 border-grapefruit text-grapefruit'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'instructions'
                ? 'border-b-2 border-grapefruit text-grapefruit'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('instructions')}
          >
            Instructions
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'reviews'
                ? 'border-b-2 border-grapefruit text-grapefruit'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="md:col-span-2">
            {activeTab === 'ingredients' && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Required Ingredients</h2>
                  <div className="grid gap-4">
                    {recipe.extendedIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                            alt={ingredient.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">{ingredient.name}</h3>
                          <p className="text-sm text-gray-500">
                            {ingredient.amount} {ingredient.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4 text-orange-600">Missing Ingredients</h2>
                    <div className="grid gap-4">
                      {recipe.missedIngredients.map((ingredient) => (
                        <div key={ingredient.id} className="flex items-center">
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                              alt={ingredient.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium">{ingredient.name}</h3>
                            <p className="text-sm text-gray-500">
                              {ingredient.amount} {ingredient.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Cooking Instructions</h2>
                <div className="space-y-8">
                  {recipe.analyzedInstructions[0]?.steps.map((step) => (
                    <div key={step.number} className="flex">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-grapefruit text-white flex items-center justify-center font-medium">
                        {step.number}
                      </div>
                      <div className="ml-4">
                        <p className="text-gray-700">{step.step}</p>
                        {(step.ingredients?.length > 0 || step.equipment?.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {step.ingredients?.map((ingredient) => (
                              <span
                                key={ingredient.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {ingredient.name}
                              </span>
                            ))}
                            {step.equipment?.map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {item.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Cooking Reviews</h2>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-grapefruit/10 text-grapefruit flex items-center justify-center font-medium">
                            {review.user.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">{review.user}</h3>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Quick Info</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Preparation Time</h3>
                  <p className="mt-1 text-lg">{recipe.readyInMinutes} minutes</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Servings</h3>
                  <p className="mt-1 text-lg">{recipe.servings}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Health Score</h3>
                  <p className="mt-1 text-lg">{recipe.healthScore}/100</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price per Serving</h3>
                  <p className="mt-1 text-lg">${(recipe.pricePerServing / 100).toFixed(2)}</p>
                </div>
                {/* Video section - to be implemented */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Video Guide</h3>
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-500">
                    Video coming soon!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 