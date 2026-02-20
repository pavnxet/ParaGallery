export const groupPhotosByDate = (photos) => {
  if (!photos || photos.length === 0) return []

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groupedMap = photos.reduce((acc, photo) => {
    const date = new Date(photo.created_at)
    // Normalize to midnight for comparison
    const photoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const time = photoDate.getTime()

    let title
    if (time === today.getTime()) {
      title = 'Today'
    } else if (time === yesterday.getTime()) {
      title = 'Yesterday'
    } else {
      const options = { weekday: 'long', month: 'long', day: 'numeric' }
      if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric'
      }
      title = date.toLocaleDateString('en-US', options)
    }

    if (!acc[title]) {
      acc[title] = {
        title: title,
        sortKey: time,
        photos: []
      }
    }
    acc[title].photos.push(photo)
    return acc
  }, {})

  // Sort groups by date descending
  return Object.values(groupedMap).sort((a, b) => b.sortKey - a.sortKey)
}
