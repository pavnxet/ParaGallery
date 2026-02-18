import axios from 'axios'

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'

export const uploadImage = async (file) => {
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API Key is missing')
  }

  const formData = new FormData()
  formData.append('image', file)
  formData.append('key', IMGBB_API_KEY)

  try {
    const response = await axios.post(IMGBB_API_URL, formData)
    return response.data.data
  } catch (error) {
    console.error('Error uploading to ImgBB:', error)
    throw error
  }
}
