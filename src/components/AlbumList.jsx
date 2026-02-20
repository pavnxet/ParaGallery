import { useEffect, useState } from 'react'
import { fetchAlbums, deleteAlbum } from '../lib/db'
import { Folder, Trash2 } from 'lucide-react'

const AlbumList = ({ userId, onAlbumClick }) => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const data = await fetchAlbums(userId)
        setAlbums(data || [])
      } catch (error) {
        console.error('Error loading albums:', error)
      } finally {
        setLoading(false)
      }
    }
    if (userId) loadAlbums()
  }, [userId])

  if (loading) return <div className="text-center py-10">Loading albums...</div>

  if (albums.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <p className="text-lg">No albums yet. Create one when uploading photos!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {albums.map(album => (
        <div
          key={album.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
          onClick={() => onAlbumClick(album)}
        >
          <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative group">
            <Folder className="w-16 h-16 text-indigo-300 dark:text-gray-500" />
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Are you sure you want to delete this album? Photos inside will not be deleted.')) {
                  deleteAlbum(album.id)
                    .then(() => setAlbums(prev => prev.filter(a => a.id !== album.id)))
                    .catch(err => {
                      console.error('Error deleting album:', err)
                      alert('Failed to delete album')
                    })
                }
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none"
              title="Delete Album"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{album.name}</h3>
            {album.description && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{album.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AlbumList
