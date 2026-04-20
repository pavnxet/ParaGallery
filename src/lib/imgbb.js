import axios from 'axios'

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'

// IMPORTANT: For production, this should be proxied through your backend
// to avoid exposing the API key. See README for setup instructions.

export const uploadImage = async (file) => {
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API Key is missing. Please set VITE_IMGBB_API_KEY in your environment.')
  }

  // Validate file before upload
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided')
  }

  const formData = new FormData()
  formData.append('image', file)
  formData.append('key', IMGBB_API_KEY)
  // Optional: Add expiration (in seconds) - 6 months = 15552000 seconds
  // formData.append('expiration', '15552000')

  try {
    const response = await axios.post(IMGBB_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30 second timeout
    })
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Upload failed')
    }
    
    return response.data.data
  } catch (error) {
    console.error('Error uploading to ImgBB:', error.message)
    // Don't expose internal error details to the client
    throw new Error('Failed to upload image. Please try again.')
  }
}
