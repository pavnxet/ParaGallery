import axios from 'axios'

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Validates file before upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateFile = (file) => {
  // Check file type using MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File too large. Maximum size is 5MB.'
    }
  }

  // Additional check: verify file extension matches MIME type
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const fileName = file.name.toLowerCase()
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: 'Invalid file extension.'
    }
  }

  return { isValid: true, error: null }
}

export const uploadImage = async (file) => {
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API Key is missing')
  }

  // Validate file before upload
  const validation = validateFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  const formData = new FormData()
  formData.append('image', file)
  formData.append('key', IMGBB_API_KEY)
  // Add expiration (optional): 1 month = 2592000 seconds
  formData.append('expiration', '2592000')

  try {
    const response = await axios.post(IMGBB_API_URL, formData, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error?.message || 'Upload failed')
    }
    
    return response.data.data
  } catch (error) {
    console.error('Error uploading to ImgBB:', error.message)
    // Don't expose internal error details to users
    if (error.response?.status === 429) {
      throw new Error('Too many upload attempts. Please try again later.')
    }
    throw new Error('Failed to upload image. Please try again.')
  }
}
