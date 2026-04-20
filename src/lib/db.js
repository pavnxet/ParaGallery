import { supabase } from './supabaseClient'

// Sanitize search term to prevent SQL injection-like issues
const sanitizeSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return ''
  // Remove special characters that could be used in LIKE queries
  return term.replace(/[%_\\]/g, '').trim().substring(0, 100)
}

export const insertPhoto = async (photoData) => {
  const { data, error } = await supabase
    .from('photos')
    .insert([photoData])
    .select()

  if (error) throw error
  return data[0]
}

export const fetchUserPhotos = async (userId, options = {}) => {
  let query = supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)

  if (options.albumId) {
    query = query.eq('album_id', options.albumId)
  }

  if (options.favorites) {
    query = query.eq('is_favorite', true)
  }

  if (options.searchTerm) {
    // Sanitize search term before using in query
    const sanitizedTerm = sanitizeSearchTerm(options.searchTerm)
    if (sanitizedTerm) {
      query = query.ilike('name', `%${sanitizedTerm}%`)
    }
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data
}

export const deletePhoto = async (photoId) => {
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)

  if (error) throw error
}

export const deleteAlbum = async (albumId) => {
  // First, orphan the photos
  const { error: orphanError } = await supabase
    .from('photos')
    .update({ album_id: null })
    .eq('album_id', albumId)

  if (orphanError) throw orphanError

  // Then delete the album
  const { error: deleteError } = await supabase
    .from('albums')
    .delete()
    .eq('id', albumId)

  if (deleteError) throw deleteError
}

export const deleteMultiplePhotos = async (photoIds) => {
  // Validate that all IDs are valid UUIDs or numbers
  const validatedIds = photoIds.filter(id => 
    typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
    typeof id === 'number'
  )
  
  if (validatedIds.length === 0) {
    throw new Error('No valid photo IDs provided')
  }
  
  const { error } = await supabase
    .from('photos')
    .delete()
    .in('id', validatedIds)

  if (error) throw error
}

export const toggleFavorite = async (photoId, isFavorite) => {
  const { error } = await supabase
    .from('photos')
    .update({ is_favorite: isFavorite })
    .eq('id', photoId)

  if (error) throw error
}

// Album functions
export const createAlbum = async (albumData) => {
  // Sanitize album name
  if (!albumData.name || typeof albumData.name !== 'string') {
    throw new Error('Invalid album name')
  }
  
  const sanitizedAlbumData = {
    ...albumData,
    name: albumData.name.trim().substring(0, 100)
  }
  
  const { data, error } = await supabase
    .from('albums')
    .insert([sanitizedAlbumData])
    .select()

  if (error) throw error
  return data[0]
}

export const fetchAlbums = async (userId) => {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const addPhotoToAlbum = async (photoId, albumId) => {
  const { error } = await supabase
    .from('photos')
    .update({ album_id: albumId })
    .eq('id', photoId)

  if (error) throw error
}
