import { UploadCloud } from 'lucide-react'

const DragOverlay = ({ isDragging }) => {
  if (!isDragging) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-600/90 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-none">
      <div className="text-center text-white">
        <UploadCloud className="w-32 h-32 mx-auto mb-8 animate-bounce" />
        <h2 className="text-4xl font-bold mb-4">Drop files to upload</h2>
        <p className="text-xl opacity-90">Release your images anywhere on the page</p>
      </div>
    </div>
  )
}

export default DragOverlay
