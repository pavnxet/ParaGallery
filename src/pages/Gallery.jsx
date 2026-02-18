import { useEffect, useState } from 'react'
import Masonry from 'react-masonry-css'
import { fetchUserPhotos, deletePhoto } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'
import PhotoCard from '../components/PhotoCard'
import PhotoModal from '../components/PhotoModal'
import { Loader2 } from 'lucide-react'

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

  useEffect(() => {
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

  if (loading && photos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
