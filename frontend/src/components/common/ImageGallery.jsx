import { useState } from 'react'

const ImageGallery = ({ images = [], alt = 'Product' }) => {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square flex items-center justify-center text-gray-400">
        <span>🖼️ Sin imagen</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
        <img
          src={images[selectedImage]}
          alt={`${alt} ${selectedImage + 1}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedImage
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              }`}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {selectedImage + 1} de {images.length}
        </div>
      )}

      {/* Keyboard Navigation */}
      <div className="text-xs text-gray-400 text-center hidden md:block">
        💡 Usa ← → para navegar
      </div>
    </div>
  )
}

export default ImageGallery
