import Image from 'next/image';

const sampleImages = [
  {
    id: 1,
    url: '/food1.jpg',
    title: 'Delicious Pasta',
    credit: {
      name: 'AI Generated',
      username: 'ai'
    }
  },
  {
    id: 2,
    url: '/food2.png',
    title: 'Fresh Salad',
    credit: {
      name: 'AI Generated',
      username: 'ai'
    }
  },
  {
    id: 3,
    url: '/food3.jpg',
    title: 'Gourmet Burger',
    credit: {
      name: 'AI Generated',
      username: 'ai'
    }
  }
];

export default function RecipeImages() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6">Recipe Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleImages.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-w-16 aspect-h-9 relative rounded-lg overflow-hidden">
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white text-sm">
                  <div className="font-medium">{image.title}</div>
                  <div className="text-white/80">
                    AI Generated Image
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 