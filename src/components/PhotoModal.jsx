import { X, Share2, Download, Check } from 'lucide-react'
import { useState } from 'react'

const PhotoModal = ({ photo, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!photo) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(photo.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
      // Fallback for older browsers or non-secure contexts if needed
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      // Extract filename from URL or use default
      const filename = photo.url.substring(photo.url.lastIndexOf('/') + 1) || 'download.jpg'
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback
      window.open(photo.url, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-5xl max-h-screen w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 focus:outline-none z-10"
        >
          <X className="w-8 h-8" />
        </button>
        <div className="relative group">
            <img
            src={photo.url}
            alt="Full size"
            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
            />

            {/* Action Buttons Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={handleCopyLink}
                    className="flex items-center space-x-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-colors"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    <span className="text-sm font-medium">{copied ? 'Copied' : 'Copy Link'}</span>
                </button>

                <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-colors"
                >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoModal
