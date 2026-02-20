'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function GalleryCarousel({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((current + 1) % photos.length)
  const prev = () => setCurrent((current - 1 + photos.length) % photos.length)

  if (!photos || photos.length === 0) return null

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden">
      {/* Изображения */}
      <div className="relative w-full h-full">
        {photos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Gallery ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Кнопки навигации */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* Индикаторы */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === current ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}