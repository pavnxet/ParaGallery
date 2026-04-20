import { Trash2 } from 'lucide-react'

const PhotoCard = ({ photo, onClick, onDelete }) => {
  const handleDeleteClick = (e) => {
    e.stopPropagation()
    // Use a custom confirmation instead of window.confirm for better UX
    if (window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      onDelete(photo.id)
    }
  }

  return (
    <div className="relative group overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800 break-inside-avoid mb-4">
      <img
        src={photo.thumb_url || photo.url}
        alt="User uploaded"
        className="w-full h-auto object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={() => onClick(photo)}
        loading="lazy"
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleDeleteClick}
          className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none shadow-sm"
          title="Delete"
          aria-label="Delete photo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PhotoCard
