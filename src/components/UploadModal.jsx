import { useState, useEffect } from 'react'
import { uploadImage } from '../lib/imgbb'
import { insertPhoto } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'
import { X, UploadCloud, Check, Loader2, AlertCircle, Trash2 } from 'lucide-react'

const UploadModal = ({ isOpen, onClose, onUploadSuccess, droppedFiles, onClearDroppedFiles }) => {
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()

  // Handle dropped files
  useEffect(() => {
    if (droppedFiles && droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles).map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending', // pending, uploading, success, error
        error: null,
        preview: URL.createObjectURL(file)
      }))

      // Use setTimeout to avoid synchronous state update warning
      setTimeout(() => {
        setFiles(prev => [...prev, ...newFiles])
        if (onClearDroppedFiles) onClearDroppedFiles()
      }, 0)
    }
  }, [droppedFiles, onClearDroppedFiles])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })
    }
  }, [files])

  // Reset state when modal is fully closed?
  // We'll keep the state so users can see previous uploads if they open/close rapidly,
  // but usually we want to clear on open if it was closed.
  // Let's rely on user manually clearing or successful upload clearing.
  // Actually, if I close and reopen, I might expect a clean slate.
  // Let's clear if the modal is closed and we are done.
  useEffect(() => {
      if (!isOpen) {
          // If we want to reset when closed
          // setFiles([])
      }
  }, [isOpen])


  if (!isOpen) return null

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        error: null,
        preview: URL.createObjectURL(file)
      }))
      setFiles(prev => [...prev, ...newFiles])
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

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error')
    if (pendingFiles.length === 0) {
        // If all are success, maybe close?
        if (files.every(f => f.status === 'success')) {
            onClose()
            setFiles([])
        }
        return
    }

    setIsUploading(true)

    // Parallel upload
    const uploadPromises = pendingFiles.map(async (fileObj) => {
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', error: null } : f))

      try {
        const imgData = await uploadImage(fileObj.file)

        const photoData = {
          user_id: user.id,
          url: imgData.url,
          thumb_url: imgData.thumb?.url || imgData.url,
          delete_url: imgData.delete_url,
          size: imgData.size || fileObj.file.size,
          width: imgData.width,
          height: imgData.height,
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

    // Refresh gallery
    if (onUploadSuccess) onUploadSuccess()

    // Note: We don't auto-close here to let user see results (success/failure)
  }

  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length
  const successCount = files.filter(f => f.status === 'success').length
  const hasFiles = files.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
            <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Photos</h2>

        <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
            {/* Drop zone / Add button */}
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
                    Click to add images or drag and drop
                </span>
            </div>

            {/* File List */}
            {hasFiles && (
                <div className="space-y-3">
                    {files.map(fileObj => (
                        <div key={fileObj.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-3 truncate flex-1">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0 relative">
                                    <img src={fileObj.preview} alt="preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="truncate min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={fileObj.file.name}>{fileObj.file.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{(fileObj.file.size / 1024).toFixed(0)} KB</p>
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
                onClick={onClose}
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
