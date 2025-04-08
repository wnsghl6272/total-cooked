function ImageUpload() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Or upload a photo</h2>
      <div className="border-2 border-dashed border-grapefruit/20 rounded-lg p-8 text-center hover:border-grapefruit/40 transition-colors">
        <input type="file" className="hidden" id="image-upload" accept="image/*" />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="w-12 h-12 bg-grapefruit-light rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-grapefruit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-gray-600">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
        </label>
      </div>
      {/* Image Upload Search Button */}
      <div className="mt-6">
        <button
          onClick={() => {/* Image processing logic will go here */}}
          className="w-full bg-grapefruit text-white py-3 rounded-lg hover:bg-grapefruit-dark transition-colors"
        >
          Search with Image
        </button>
      </div>
    </div>
  );
}

export default ImageUpload; 