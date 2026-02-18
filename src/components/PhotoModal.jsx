import { X } from 'lucide-react'

const PhotoModal = ({ photo, onClose }) => {
  if (!photo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-5xl max-h-screen w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 focus:outline-none z-10"
        >
          <X className="w-8 h-8" />
        </button>
        <img
          src={photo.url}
          alt="Full size"
          className="max-w-full max-h-[90vh] rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>
  )
}

export default PhotoModal
