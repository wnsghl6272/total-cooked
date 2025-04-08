import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-grapefruit">TotallyCooked</span>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/recipes" className="text-gray-600 hover:text-grapefruit">
              Recipes
            </Link>
            <Link href="/ingredients" className="text-gray-600 hover:text-grapefruit">
              Ingredients
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-grapefruit">
              Community
            </Link>
          </div>

          {/* Login Button */}
          <div className="flex items-center">
            <button className="bg-grapefruit text-white px-4 py-2 rounded-lg hover:bg-grapefruit-dark transition-colors">
              Login
            </button>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden ml-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 