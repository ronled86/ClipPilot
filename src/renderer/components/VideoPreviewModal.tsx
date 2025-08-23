import React, { useEffect } from 'react'

interface VideoPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  title: string
}

export default function VideoPreviewModal({ isOpen, onClose, videoId, title }: VideoPreviewModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium truncate pr-4" title={title}>{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
        
        {/* Video Player */}
        <div className="aspect-video bg-black relative">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&fs=1&origin=${window.location.origin}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          
          {/* Fallback overlay if embedding fails */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                const url = `https://www.youtube.com/watch?v=${videoId}`
                window.open(url, '_blank')
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Watch on YouTube
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to close
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                const url = `https://www.youtube.com/watch?v=${videoId}`
                window.open(url, '_blank')
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Open in YouTube
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
