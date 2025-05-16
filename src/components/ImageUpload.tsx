import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRef, useState } from 'react';

interface ImageUploadProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

function ImageUpload({ onIngredientsDetected }: ImageUploadProps) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      router.push('/auth/signin?redirect=/cook');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      console.log('Sending request to analyze-image API...');

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      if (data.ingredients && data.ingredients.length > 0) {
        console.log('Detected ingredients:', data.ingredients);
        onIngredientsDetected(data.ingredients);
      } else {
        setError('No ingredients detected in the image');
      }
    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (!user) {
      router.push('/auth/signin?redirect=/cook');
      return;
    }

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const input = fileInputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClick = () => {
    if (!user) {
      router.push('/auth/signin?redirect=/cook');
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Or upload a photo</h2>
      <div 
        className="border-2 border-dashed border-grapefruit/20 hover:border-grapefruit/40 rounded-lg p-8 text-center transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*" 
          disabled={isAnalyzing}
        />
        <label className="cursor-pointer">
          <div className="w-12 h-12 bg-grapefruit-light rounded-full mx-auto mb-4 flex items-center justify-center">
            {isAnalyzing ? (
              <div className="w-6 h-6 border-2 border-grapefruit border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6 text-grapefruit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <p className="text-gray-600">
            {isAnalyzing ? 'Analyzing image...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
        </label>
      </div>
      
      {error && (
        <div className="mt-4 text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default ImageUpload; 