import { useState, useEffect } from 'react'
import { X, Download, Link as LinkIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react'

const PhotoModal = ({ photo, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasNext, hasPrev, onNext, onPrev, onClose])

  if (!photo) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = photo.name || `photo-${photo.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download image')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(photo.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Failed to copy link')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-5xl max-h-screen w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <div className="absolute -top-12 right-0 flex gap-4 z-10">
          <button
            onClick={handleCopyLink}
            className="p-2 text-white hover:text-gray-300 focus:outline-none"
            title="Copy Direct Link"
          >
            {copied ? <Check className="w-8 h-8 text-green-400" /> : <LinkIcon className="w-8 h-8" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:text-gray-300 focus:outline-none"
            title="Download High-Res"
          >
            <Download className="w-8 h-8" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-gray-300 focus:outline-none"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            className="absolute left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20 focus:outline-none"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <img
          src={photo.url}
          alt="Full size"
          className="max-w-full max-h-[90vh] rounded-lg object-contain shadow-2xl z-0"
        />

        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="absolute right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20 focus:outline-none"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  )
}

export default PhotoModal
