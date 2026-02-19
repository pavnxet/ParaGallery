export const groupPhotosByDate = (photos) => {
  if (!photos || photos.length === 0) return []

  const groupedMap = photos.reduce((acc, photo) => {
    const date = new Date(photo.created_at)
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    // We also need a sort key, e.g., YYYY-MM
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!acc[key]) {
      acc[key] = {
        title: key,
        sortKey: sortKey,
        photos: []
      }
    }
    acc[key].photos.push(photo)
    return acc
  }, {})

  // Sort groups by date descending
  return Object.values(groupedMap).sort((a, b) => b.sortKey.localeCompare(a.sortKey))
}
