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
