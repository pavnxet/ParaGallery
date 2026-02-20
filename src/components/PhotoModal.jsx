import { useState, useEffect } from 'react'
import { Download, Link as LinkIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react'

const PhotoModal = ({ photo, onClose, onNext, onPrev, hasNext, hasPrev, onDelete, onToggleFavorite }) => {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

        {/* Top Action Bar */}
        <div className="absolute -top-24 right-0 flex gap-4 z-50 items-center justify-end w-full px-4 sm:px-0 flex-wrap sm:flex-nowrap">

          {/* Favorite Button */}
          <div className="ui-heart-container" title="Like/Unlike">
            <input
                type="checkbox"
                className="checkbox"
                checked={!!photo.is_favorite}
                onChange={() => onToggleFavorite && onToggleFavorite(photo)}
            />
            <div className="svg-container">
                <svg viewBox="0 0 24 24" className="svg-outline" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                    </path>
                </svg>
                <svg viewBox="0 0 24 24" className="svg-filled" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                    </path>
                </svg>
                <svg className="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="10,10 20,20"></polygon>
                    <polygon points="10,50 20,50"></polygon>
                    <polygon points="20,80 30,70"></polygon>
                    <polygon points="90,10 80,20"></polygon>
                    <polygon points="90,50 80,50"></polygon>
                    <polygon points="80,80 70,70"></polygon>
                </svg>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="ui-btn-action share"
            title="Copy Direct Link"
          >
             {copied ? <Check className="w-6 h-6 text-green-400" /> : <LinkIcon className="w-6 h-6 text-white" />}
             <div className="close">{copied ? 'Copied' : 'Share'}</div>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="ui-btn-action download"
            title="Download High-Res"
          >
            <Download className="w-6 h-6 text-white" />
            <div className="close">Download</div>
          </button>

          {/* Delete Button */}
          <button
            className="ui-btn-delete"
            onClick={() => {
                if (window.confirm('Are you sure you want to delete this photo?')) {
                    onDelete && onDelete(photo.id)
                    onClose()
                }
            }}
            title="Delete Photo"
          >
            <svg viewBox="0 0 448 512" className="svgIcon"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="ui-btn-action"
            title="Close Modal"
          >
            <span className="X"></span>
            <span className="Y"></span>
            <div className="close">Close</div>
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

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="loader">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          </div>
        )}

        <img
          src={photo.url}
          alt="Full size"
          className={`max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl z-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
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
