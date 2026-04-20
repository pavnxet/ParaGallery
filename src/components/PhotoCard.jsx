import { Trash2, Heart, Check } from 'lucide-react'

const PhotoCard = ({ photo, onClick, onDelete, onToggleFavorite, isSelectionMode, isSelected, onToggleSelection }) => {
  const handleClick = (e) => {
      // If in selection mode, any click on the card toggles selection
      if (isSelectionMode) {
          e.preventDefault() // prevent modal opening if that's default
          onToggleSelection(photo.id)
      } else {
          onClick(photo)
      }
  }
  
  const handleDelete = () => {
    // Custom confirmation modal would be better, but for now we use a safer pattern
    if (window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      onDelete(photo.id)
    }
  }

  return (
    <div
        className={`relative group overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800 break-inside-avoid mb-4 transition-all duration-200 ${isSelected ? 'ring-4 ring-indigo-500 transform scale-95' : ''}`}
    >
      <img
        src={photo.thumb_url || photo.url}
        alt={photo.name || "User uploaded"}
        className="w-full h-auto object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={handleClick}
        loading="lazy"
      />

      {/* Selection Overlay/Checkbox */}
      {isSelectionMode && (
         <div
            className="absolute top-2 left-2 z-10 cursor-pointer"
            onClick={(e) => {
                e.stopPropagation()
                onToggleSelection(photo.id)
            }}
         >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-black/30 border-white hover:bg-black/50'}`}>
                {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
         </div>
      )}

      {/* Standard Actions (Hidden in Selection Mode) */}
      {!isSelectionMode && (
        <>
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(photo)
                }}
                className={`p-1.5 rounded-full shadow-sm focus:outline-none transition-colors ${
                    photo.is_favorite
                    ? 'bg-white text-red-500 hover:bg-gray-100'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title={photo.is_favorite ? "Remove from favorites" : "Add to favorites"}
                >
                <Heart className={`w-4 h-4 ${photo.is_favorite ? 'fill-current' : ''}`} />
                </button>

                <button
                onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                }}
                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none shadow-sm"
                title="Delete"
                >
                <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {photo.is_favorite && (
                <div className="absolute bottom-2 right-2 pointer-events-none group-hover:opacity-0 transition-opacity">
                    <Heart className="w-4 h-4 text-red-500 fill-current drop-shadow-md" />
                </div>
            )}
        </>
      )}
    </div>
  )
}

export default PhotoCard
