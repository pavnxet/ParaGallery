import { supabase } from './supabaseClient'

export const insertPhoto = async (photoData) => {
  const { data, error } = await supabase
    .from('photos')
    .insert([photoData])
    .select()

  if (error) throw error
  return data[0]
}

export const fetchUserPhotos = async (userId, options = {}) => {
  // Although RLS should handle this, we explicitly filter by user_id as per requirements
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
    query = query.ilike('name', `%${options.searchTerm}%`)
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

export const deleteMultiplePhotos = async (photoIds) => {
  const { error } = await supabase
    .from('photos')
    .delete()
    .in('id', photoIds)

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
  const { data, error } = await supabase
    .from('albums')
    .insert([albumData])
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
