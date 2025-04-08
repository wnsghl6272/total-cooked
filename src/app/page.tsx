import Image from "next/image";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Head from 'next/head';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Head>
        <title>totallyCooked - Transform Ingredients into Delicious Meals</title>
        <meta name="description" content="Use AI to turn your ingredients into delicious meals with personalized recipe suggestions." />
        <meta name="keywords" content="recipes, cooking, AI, ingredients, food, meal planning" />
        <meta property="og:title" content="totallyCooked - Transform Ingredients into Delicious Meals" />
        <meta property="og:description" content="Use AI to turn your ingredients into delicious meals with personalized recipe suggestions." />
        <meta property="og:image" content="/path/to/your/image.jpg" />
        <meta property="og:url" content="https://yourwebsite.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="totallyCooked - Transform Ingredients into Delicious Meals" />
        <meta name="twitter:description" content="Use AI to turn your ingredients into delicious meals with personalized recipe suggestions." />
        <meta name="twitter:image" content="/path/to/your/image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "totallyCooked - Transform Ingredients into Delicious Meals",
            "description": "Use AI to turn your ingredients into delicious meals with personalized recipe suggestions.",
            "url": "https://yourwebsite.com",
            "image": "/path/to/your/image.jpg"
          })}
        </script>
        <link rel="canonical" href="https://yourwebsite.com" />
      </Head>
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn Your Ingredients into
            <span className="text-grapefruit"> Delicious Meals</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Simply input your ingredients or upload a photo, and our AI will identify them instantly. Get personalized recipe suggestions with detailed instructions and video guides.
          </p>
        </div>

        {/* Image Carousel */}
        <div className="max-w-5xl mx-auto my-16 relative overflow-hidden rounded-2xl">
          <div className="flex animate-scroll">
            <div className="flex-none w-64 h-64 md:w-80 md:h-80 relative mx-2">
              <Image
                src="/food1.jpg"
                alt="Delicious pasta dish"
                fill
                className="object-cover rounded-xl"
              />
            </div>
            <div className="flex-none w-64 h-64 md:w-80 md:h-80 relative mx-2">
              <Image
                src="/food2.png"
                alt="Fresh salad"
                fill
                className="object-cover rounded-xl"
              />
            </div>
            <div className="flex-none w-64 h-64 md:w-80 md:h-80 relative mx-2">
              <Image
                src="/food3.jpg"
                alt="Grilled steak"
                fill
                className="object-cover rounded-xl"
              />
            </div>
            {/* Duplicate images for infinite scroll */}
            <div className="flex-none w-64 h-64 md:w-80 md:h-80 relative mx-2">
              <Image
                src="/food1.jpg"
                alt="Delicious pasta dish"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/cook" 
            className="bg-grapefruit text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-grapefruit-dark transition-colors inline-block"
          >
            Start Cooking
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-grapefruit-light rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-grapefruit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Ingredient Recognition</h3>
            <p className="text-gray-600">Our advanced AI instantly identifies ingredients from photos or text input.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-grapefruit-light rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-grapefruit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Recipe Matching</h3>
            <p className="text-gray-600">Get perfectly matched recipes based on your available ingredients with step-by-step guides.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-grapefruit-light rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-grapefruit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Video Tutorials</h3>
            <p className="text-gray-600">Watch expert cooking videos and follow along with detailed instructions for each recipe.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">About totallyCooked</h4>
            <p className="text-gray-600">Transform your ingredients into delicious meals with AI-powered recipe suggestions and cooking guides.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/recipes" className="text-gray-600 hover:text-grapefruit">Recipes</Link></li>
              <li><Link href="/ingredients" className="text-gray-600 hover:text-grapefruit">Ingredients</Link></li>
              <li><Link href="/community" className="text-gray-600 hover:text-grapefruit">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-600 hover:text-grapefruit">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-grapefruit">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-grapefruit">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-grapefruit">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-grapefruit">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-grapefruit">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500">
            © 2024 totallyCooked. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
