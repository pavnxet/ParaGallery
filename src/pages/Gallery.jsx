import { useEffect, useState, useMemo, useCallback } from 'react'
import Masonry from 'react-masonry-css'
import { fetchUserPhotos, deletePhoto, toggleFavorite, deleteMultiplePhotos } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'
import PhotoCard from '../components/PhotoCard'
import PhotoModal from '../components/PhotoModal'
import AlbumList from '../components/AlbumList'
import { Loader2, ArrowLeft, CheckSquare, Trash2, X } from 'lucide-react'
import { groupPhotosByDate } from '../lib/dateUtils'

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const Gallery = ({ refreshTrigger, searchTerm, activeView }) => {
  const { user } = useAuth()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // Reset selected album if activeView changes
  useEffect(() => {
    if (activeView !== 'albums') {
      setSelectedAlbum(null)
    }
  }, [activeView])

  // Reset selection mode when view changes
  useEffect(() => {
    setSelectedPhotoIds(new Set())
    setIsSelectionMode(false)
  }, [activeView, selectedAlbum, searchTerm])

  const loadPhotos = useCallback(async () => {
    if (!user) return

    // If we are in albums view but no album selected, we show AlbumList, no need to fetch photos
    if (activeView === 'albums' && !selectedAlbum) {
        setPhotos([])
        return
    }

    setLoading(true)
    try {
      const options = {
        searchTerm,
        favorites: activeView === 'favorites',
        albumId: selectedAlbum?.id
      }
      const data = await fetchUserPhotos(user.id, options)
      setPhotos(data || [])
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setLoading(false)
    }
  }, [user, searchTerm, activeView, selectedAlbum])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos, refreshTrigger])

  const handleDelete = async (photoId) => {
    try {
      await deletePhoto(photoId)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo')
    }
  }

  const handleToggleFavorite = async (photo) => {
    const newStatus = !photo.is_favorite
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_favorite: newStatus } : p))
    try {
      await toggleFavorite(photo.id, newStatus)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_favorite: !newStatus } : p))
      alert('Failed to update favorite status')
    }
  }

  const toggleSelection = (photoId) => {
    const newSelected = new Set(selectedPhotoIds)
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      newSelected.add(photoId)
    }
    setSelectedPhotoIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedPhotoIds.size === 0) return
    if (!window.confirm(`Delete ${selectedPhotoIds.size} photos? This cannot be undone.`)) return

    try {
      const ids = Array.from(selectedPhotoIds)
      await deleteMultiplePhotos(ids)
      setPhotos(prev => prev.filter(p => !selectedPhotoIds.has(p.id)))
      setSelectedPhotoIds(new Set())
      setIsSelectionMode(false)
    } catch (error) {
      console.error('Error deleting photos:', error)
      alert('Failed to delete photos')
    }
  }

  const groupedPhotos = useMemo(() => groupPhotosByDate(photos), [photos])

  if (activeView === 'albums' && !selectedAlbum) {
      return (
          <div className="container mx-auto px-4 py-8">
              <AlbumList userId={user?.id} onAlbumClick={setSelectedAlbum} />
          </div>
      )
  }

  if (loading && photos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
          {selectedAlbum ? (
              <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedAlbum(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                      <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedAlbum.name}</h1>
                    {selectedAlbum.description && <p className="text-gray-500 dark:text-gray-400">{selectedAlbum.description}</p>}
                  </div>
              </div>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {activeView === 'favorites' ? 'Favorites' : 'All Photos'}
            </h1>
          )}

          {photos.length > 0 && (
              <button
                onClick={() => {
                    setIsSelectionMode(!isSelectionMode)
                    setSelectedPhotoIds(new Set())
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${isSelectionMode ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                  {isSelectionMode ? <X className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                  <span>{isSelectionMode ? 'Cancel' : 'Select'}</span>
              </button>
          )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg">No photos found.</p>
        </div>
      ) : (
        groupedPhotos.map(group => (
            <div key={group.title} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 sticky top-16 z-40 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm py-2 px-2 rounded-md">
                    {group.title}
                </h2>
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="flex w-auto -ml-4"
                  columnClassName="pl-4 bg-clip-padding"
                >
                  {group.photos.map(photo => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onClick={() => {
                          if (isSelectionMode) {
                              toggleSelection(photo.id)
                          } else {
                              setSelectedPhoto(photo)
                          }
                      }}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedPhotoIds.has(photo.id)}
                      onToggleSelection={toggleSelection}
                    />
                  ))}
                </Masonry>
            </div>
        ))
      )}

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Floating Toolbar */}
      {isSelectionMode && selectedPhotoIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-full px-6 py-3 flex items-center gap-6 z-50 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5 duration-200">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {selectedPhotoIds.size} selected
              </span>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <button
                onClick={handleBulkDelete}
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2 whitespace-nowrap"
                title="Delete Selected"
              >
                  <Trash2 className="w-5 h-5" />
                  <span className="">Delete</span>
              </button>
          </div>
      )}
    </div>
  )
}

export default Gallery
