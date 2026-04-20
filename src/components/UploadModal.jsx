import { useState, useEffect } from 'react'
import { uploadImage } from '../lib/imgbb'
import { insertPhoto, fetchAlbums, createAlbum } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'
import { X, UploadCloud, Check, Loader2, AlertCircle, Trash2, Folder, FolderPlus } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

// Validate file type using magic bytes
const validateFileType = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const arr = new Uint8Array(reader.result).subarray(0, 4)
      let header = ''
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0')
      }
      
      // Check magic bytes for common image formats
      const isValid = 
        header.startsWith('ffd8ffe') || // JPEG
        header.startsWith('89504e47') || // PNG
        header.startsWith('47494638') || // GIF
        header.startsWith('52494646') // WebP (RIFF)
      
      resolve(isValid)
    }
    reader.readAsArrayBuffer(file.slice(0, 4))
  })
}

const validateFile = async (file) => {
  const errors = []
  
  // Check file extension
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`)
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push(`Invalid MIME type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`)
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }
  
  // Validate magic bytes
  const isValidType = await validateFileType(file)
  if (!isValidType) {
    errors.push('File type does not match content (invalid magic bytes)')
  }
  
  return errors
}

const UploadModal = ({ isOpen, onClose, onUploadSuccess, droppedFiles, onClearDroppedFiles }) => {
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [albums, setAlbums] = useState([])
  const [selectedAlbumId, setSelectedAlbumId] = useState('')
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')
  const { user } = useAuth()

  // Handle dropped files
  useEffect(() => {
    if (droppedFiles && droppedFiles.length > 0) {
      processFiles(Array.from(droppedFiles))
      if (onClearDroppedFiles) onClearDroppedFiles()
    }
  }, [droppedFiles, onClearDroppedFiles])

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })
    }
  }, [files])

  // Fetch albums when modal opens
  useEffect(() => {
    if (isOpen && user) {
        fetchAlbums(user.id).then(setAlbums).catch(console.error)
    }
  }, [isOpen, user])

  const processFiles = async (newFiles) => {
    const processedFiles = []
    
    for (const file of newFiles) {
      const errors = await validateFile(file)
      
      processedFiles.push({
        file,
        id: Math.random().toString(36).substring(7),
        status: errors.length > 0 ? 'error' : 'pending',
        error: errors.length > 0 ? errors.join('; ') : null,
        preview: errors.length === 0 ? URL.createObjectURL(file) : null
      })
    }
    
    setFiles(prev => [...prev, ...processedFiles])
  }

  if (!isOpen) return null

  const handleClose = () => {
    setIsCreatingAlbum(false)
    setNewAlbumName('')
    onClose()
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files))
    }
    e.target.value = ''
  }

  const removeFile = (id) => {
    setFiles(prev => {
        const fileToRemove = prev.find(f => f.id === id)
        if (fileToRemove && fileToRemove.preview) {
            URL.revokeObjectURL(fileToRemove.preview)
        }
        return prev.filter(f => f.id !== id)
    })
  }

  const handleCreateAlbum = async () => {
      if (!newAlbumName.trim()) return
      try {
          const album = await createAlbum({
              user_id: user.id,
              name: newAlbumName
          })
          setAlbums(prev => [album, ...prev])
          setSelectedAlbumId(album.id)
          setIsCreatingAlbum(false)
          setNewAlbumName('')
      } catch (error) {
          console.error("Failed to create album", error)
          alert("Failed to create album")
      }
  }

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error')
    if (pendingFiles.length === 0) {
        if (files.every(f => f.status === 'success')) {
            onClose()
            setFiles([])
        }
        return
    }

    setIsUploading(true)

    const uploadPromises = pendingFiles.map(async (fileObj) => {
      // Skip files with validation errors
      if (fileObj.status === 'error') {
        return
      }
      
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', error: null } : f))

      try {
        const imgData = await uploadImage(fileObj.file)

        const photoData = {
          user_id: user.id,
          url: imgData.url,
          thumb_url: imgData.thumb?.url || imgData.url,
          delete_url: imgData.delete_url,
          name: fileObj.file.name,
          album_id: selectedAlbumId || null,
          size: fileObj.file.size || 0
        }

        await insertPhoto(photoData)

        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success' } : f))
      } catch (err) {
        console.error(err)
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: 'Upload failed' } : f))
      }
    })

    await Promise.all(uploadPromises)
    setIsUploading(false)

    if (onUploadSuccess) onUploadSuccess()
  }

  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length
  const successCount = files.filter(f => f.status === 'success').length
  const hasFiles = files.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
        <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
            <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Photos</h2>

        {/* Album Selection */}
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Album (Optional)</label>
            {!isCreatingAlbum ? (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select
                            value={selectedAlbumId}
                            onChange={(e) => setSelectedAlbumId(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 pr-8"
                        >
                            <option value="">No Album</option>
                            {albums.map(album => (
                                <option key={album.id} value={album.id}>{album.name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <Folder className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreatingAlbum(true)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Create New Album"
                    >
                        <FolderPlus className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newAlbumName}
                        onChange={(e) => setNewAlbumName(e.target.value)}
                        placeholder="New Album Name"
                        className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateAlbum()
                            if (e.key === 'Escape') setIsCreatingAlbum(false)
                        }}
                    />
                    <button
                        onClick={handleCreateAlbum}
                        disabled={!newAlbumName.trim()}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create
                    </button>
                    <button
                        onClick={() => setIsCreatingAlbum(false)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                />
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Click to add images or drag and drop<br/>
                    <span className="text-xs">(Max 10MB per file, JPG/PNG/GIF/WebP only)</span>
                </span>
            </div>

            {hasFiles && (
                <div className="space-y-3">
                    {files.map(fileObj => (
                        <div key={fileObj.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-3 truncate flex-1">
                                {fileObj.preview ? (
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0 relative">
                                        <img src={fileObj.preview} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                )}
                                <div className="truncate min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={fileObj.file.name}>{fileObj.file.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{(fileObj.file.size / 1024).toFixed(0)} KB</p>
                                    {fileObj.error && (
                                        <p className="text-xs text-red-500 mt-1" title={fileObj.error}>
                                            {fileObj.error.length > 50 ? fileObj.error.substring(0, 50) + '...' : fileObj.error}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 ml-2 flex-shrink-0">
                                {fileObj.status === 'pending' && <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">Pending</span>}
                                {fileObj.status === 'uploading' && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
                                {fileObj.status === 'success' && <Check className="w-5 h-5 text-green-500" />}
                                {fileObj.status === 'error' && (
                                    <div className="flex items-center text-red-500" title={fileObj.error}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                )}

                                {fileObj.status !== 'uploading' && (
                                    <button
                                        onClick={() => removeFile(fileObj.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 mr-3"
            >
                {successCount > 0 && pendingCount === 0 ? 'Close' : 'Cancel'}
            </button>
            <button
                onClick={handleUpload}
                disabled={!hasFiles || isUploading || (pendingCount === 0 && successCount === 0)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isUploading ? 'Uploading...' : pendingCount > 0 ? `Upload ${pendingCount} Photos` : 'Done'}
            </button>
        </div>
      </div>
    </div>
  )
}

export default UploadModal
