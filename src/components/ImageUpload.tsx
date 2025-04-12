import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function ImageUpload() {
  const router = useRouter();
  const { user } = useAuth();

  const handleImageUpload = () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    // Image upload logic will go here when user is logged in
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Or upload a photo</h2>
      <div 
        className={`border-2 border-dashed ${user ? 'border-grapefruit/20 hover:border-grapefruit/40' : 'border-gray-200'} rounded-lg p-8 text-center transition-colors ${user ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
        onClick={user ? handleImageUpload : undefined}
      >
        <input type="file" className="hidden" id="image-upload" accept="image/*" disabled={!user} />
        <label htmlFor="image-upload" className={user ? 'cursor-pointer' : 'cursor-not-allowed'}>
          <div className={`w-12 h-12 ${user ? 'bg-grapefruit-light' : 'bg-gray-100'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
            <svg className={`w-6 h-6 ${user ? 'text-grapefruit' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className={`${user ? 'text-gray-600' : 'text-gray-400'}`}>
            {user ? 'Click to upload or drag and drop' : 'Sign in to upload images'}
          </p>
          <p className={`text-sm ${user ? 'text-gray-500' : 'text-gray-400'} mt-1`}>PNG, JPG up to 10MB</p>
        </label>
      </div>
      {/* Image Upload Search Button */}
      <div className="mt-6">
        <button
          onClick={user ? handleImageUpload : () => router.push('/auth/signin')}
          className={`w-full py-3 rounded-lg transition-colors ${
            user 
              ? 'bg-grapefruit text-white hover:bg-grapefruit-dark' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!user}
        >
          {user ? 'Search with Image' : 'Sign in to Search with Image'}
        </button>
      </div>
    </div>
  );
}

export default ImageUpload; 