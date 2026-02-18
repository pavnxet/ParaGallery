import { useState } from 'react'
import { uploadImage } from '../lib/imgbb'
import { insertPhoto } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'
import { X, UploadCloud } from 'lucide-react'

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  if (!isOpen) return null

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      // 1. Upload to ImgBB
      const imgData = await uploadImage(file)

      // 2. Insert into Supabase
      const photoData = {
        user_id: user.id,
        url: imgData.url,
        thumb_url: imgData.thumb?.url || imgData.url,
        delete_url: imgData.delete_url,
      }

      await insertPhoto(photoData)

      onUploadSuccess()
      onClose()
      setFile(null)
    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
            <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Photo</h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
            />
            <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 dark:text-gray-400 text-center break-all">
                {file ? file.name : "Click to select an image"}
            </span>
        </div>

        <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
            {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  )
}

export default UploadModal
