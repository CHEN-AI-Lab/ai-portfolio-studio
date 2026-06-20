'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface LightboxImage {
  src: string
  alt: string
}

interface ImageLightboxProps {
  images: LightboxImage[]
  initialIndex?: number
  onClose: () => void
}

export function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const goTo = useCallback(
    (index: number) => {
      if (index < 0) setCurrentIndex(images.length - 1)
      else if (index >= images.length) setCurrentIndex(0)
      else setCurrentIndex(index)
    },
    [images.length]
  )

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1)
  }, [currentIndex, goTo])

  const goNext = useCallback(() => {
    goTo(currentIndex + 1)
  }, [currentIndex, goTo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goPrev()
          break
        case 'ArrowRight':
          goNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  // Handle overlay click to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  if (images.length === 0) return null

  const currentImage = images[currentIndex]!

  return (
    <div className="lightbox-overlay" onClick={handleOverlayClick}>
      {/* Close button */}
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close lightbox"
        type="button"
      >
        ✕
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          className="lightbox-nav lightbox-nav--prev"
          onClick={goPrev}
          aria-label="Previous image"
          type="button"
        >
          ‹
        </button>
      )}

      {/* Image */}
      <div className="lightbox-content" style={{ width: '90vw', height: '90vh' }}>
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          draggable={false}
          sizes="90vw"
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          className="lightbox-nav lightbox-nav--next"
          onClick={goNext}
          aria-label="Next image"
          type="button"
        >
          ›
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="lightbox-counter">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
}