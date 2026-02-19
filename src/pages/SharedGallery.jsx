import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { fetchSharedGallery } from '../lib/db'
import PhotoModal from '../components/PhotoModal'
import { Loader2, AlertCircle } from 'lucide-react'

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const SharedGallery = () => {
  const { shareId } = useParams()
  const [gallery, setGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await fetchSharedGallery(shareId)
        if (!data) {
            setError('Gallery not found')
        } else {
            setGallery(data)
        }
      } catch (err) {
        console.error('Error loading shared gallery:', err)
        setError('Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }

    if (shareId) {
        loadGallery()
    }
  }, [shareId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    )
  }

  if (error) {
      return (
          <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-500">
              <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
              <p className="text-xl dark:text-gray-300">{error}</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{gallery.title || 'Shared Gallery'}</h1>
            <p className="text-gray-500 dark:text-gray-400">
                {gallery.photos.length} photo{gallery.photos.length !== 1 && 's'} • Shared via ParaGallery
            </p>
        </div>

        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
        >
            {gallery.photos.map(photo => (
            <div key={photo.id} className="mb-4 break-inside-avoid">
                <img
                    src={photo.thumb_url || photo.url}
                    alt="Shared"
                    className="w-full h-auto object-cover rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => setSelectedPhoto(photo)}
                    loading="lazy"
                />
            </div>
            ))}
        </Masonry>

        {selectedPhoto && (
            <PhotoModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            />
        )}
        </div>
    </div>
  )
}

export default SharedGallery
