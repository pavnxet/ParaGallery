import { useState, useEffect, useCallback, useRef } from 'react'

export const useGlobalDragDrop = (onDrop) => {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  const handleDragEnter = useCallback((e) => {
    if (isTouchDevice) return

    e.preventDefault()
    e.stopPropagation()

    // Check if the dragged item is a file
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const isFile = Array.from(e.dataTransfer.types).includes('Files')
      if (isFile) {
        dragCounter.current += 1
        if (dragCounter.current === 1) {
            setIsDragging(true)
        }
      }
    }
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
        setIsDragging(false)
        dragCounter.current = 0
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounter.current = 0
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      // Filter for images only
      const validFiles = files.filter(file => file.type.startsWith('image/'))

      if (validFiles.length > 0) {
        onDrop(validFiles)
      }

      e.dataTransfer.clearData()
    }
  }, [onDrop])

  useEffect(() => {
    if (isTouchDevice) return

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, isTouchDevice])

  return { isDragging }
}
