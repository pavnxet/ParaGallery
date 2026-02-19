import { supabase } from './supabaseClient'

export const insertPhoto = async (photoData) => {
  const { data, error } = await supabase
    .from('photos')
    .insert([photoData])
    .select()

  if (error) throw error
  return data[0]
}

export const fetchUserPhotos = async (userId) => {
  // Although RLS should handle this, we explicitly filter by user_id as per requirements
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

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

export const createSharedGallery = async (userId, photoIds, title = 'Shared Gallery') => {
  const { data, error } = await supabase
    .from('shared_galleries')
    .insert([{ user_id: userId, photo_ids: photoIds, title }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const fetchSharedGallery = async (shareId) => {
  const { data: gallery, error: galleryError } = await supabase
    .from('shared_galleries')
    .select('*')
    .eq('id', shareId)
    .single()

  if (galleryError) throw galleryError
  if (!gallery) return null

  if (!gallery.photo_ids || gallery.photo_ids.length === 0) {
    return { ...gallery, photos: [] }
  }

  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .in('id', gallery.photo_ids)

  if (photosError) throw photosError

  return { ...gallery, photos }
}

export const fetchUserStats = async (userId) => {
  const { data, error } = await supabase
    .from('photos')
    .select('size')
    .eq('user_id', userId)

  if (error) throw error

  const totalCount = data.length
  const totalSize = data.reduce((acc, curr) => acc + (curr.size || 0), 0)

  return { totalCount, totalSize }
}
