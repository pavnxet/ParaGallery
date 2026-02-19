import { useEffect, useState } from 'react'
import Masonry from 'react-masonry-css'
import { fetchUserPhotos, deletePhoto, createSharedGallery } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'
import PhotoCard from '../components/PhotoCard'
import PhotoModal from '../components/PhotoModal'
import { Loader2, Share2, X, Check } from 'lucide-react'

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const Gallery = ({ refreshTrigger }) => {
  const { user } = useAuth()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  // Selection Mode State
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [sharing, setSharing] = useState(false)
  const [sharedLink, setSharedLink] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    const loadPhotos = async () => {
      if (!user) return
      setLoading(true)
      try {
        const data = await fetchUserPhotos(user.id)
        setPhotos(data || [])
      } catch (error) {
        console.error('Error loading photos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPhotos()
  }, [user, refreshTrigger])

  const handleDelete = async (photoId) => {
    try {
      await deletePhoto(photoId)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo')
    }
  }

  const toggleSelectMode = () => {
      setIsSelectMode(prev => !prev)
      setSelectedIds(new Set())
      setSharedLink(null)
  }

  const handleSelect = (id) => {
      setSelectedIds(prev => {
          const newSet = new Set(prev)
          if (newSet.has(id)) {
              newSet.delete(id)
          } else {
              newSet.add(id)
          }
          return newSet
      })
  }

  const handleCreateShare = async () => {
      if (selectedIds.size === 0) return
      setSharing(true)
      try {
          const photoIds = Array.from(selectedIds)
          const gallery = await createSharedGallery(user.id, photoIds, `Shared Gallery by ${user.email}`)

          if (gallery) {
            const link = `${window.location.origin}/shared/${gallery.id}`
            setSharedLink(link)
          }
      } catch (err) {
          console.error('Share failed', err)
          alert('Failed to create share link')
      } finally {
          setSharing(false)
      }
  }

  const copySharedLink = async () => {
      if (!sharedLink) return
      try {
          await navigator.clipboard.writeText(sharedLink)
          setLinkCopied(true)
          setTimeout(() => setLinkCopied(false), 2000)
      } catch (err) {
          console.error('Copy failed', err)
      }
  }

  if (loading && photos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header / Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Your Gallery</h2>

          <div className="flex items-center space-x-4">
              {isSelectMode ? (
                  <>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{selectedIds.size} selected</span>
                    <button
                        onClick={toggleSelectMode}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateShare}
                        disabled={selectedIds.size === 0 || sharing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
                    >
                        {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                        {sharing ? 'Sharing...' : 'Share Selected'}
                    </button>
                  </>
              ) : (
                  <button
                    onClick={toggleSelectMode}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                      Select Photos
                  </button>
              )}
          </div>
      </div>

      {/* Shared Link Display */}
      {sharedLink && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-1">Link ready to share:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate bg-white dark:bg-black/20 p-2 rounded select-all">{sharedLink}</p>
              </div>
              <button
                onClick={copySharedLink}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {linkCopied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={() => setSharedLink(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
              </button>
          </div>
      )}

      {photos.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg">No photos yet. Upload your first one!</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {photos.map(photo => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
              onDelete={handleDelete}
              isSelectMode={isSelectMode}
              isSelected={selectedIds.has(photo.id)}
              onSelect={handleSelect}
            />
          ))}
        </Masonry>
      )}

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
}

export default Gallery
