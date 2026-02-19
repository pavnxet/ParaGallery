import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import UploadModal from './components/UploadModal'
import Gallery from './pages/Gallery'
import Dashboard from './pages/Dashboard'
import SharedGallery from './pages/SharedGallery'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import { useGlobalDragDrop } from './hooks/useGlobalDragDrop'
import DragOverlay from './components/DragOverlay'
import './App.css'

function AppContent() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [droppedFiles, setDroppedFiles] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { user, loading } = useAuth()

  const handleDrop = useCallback((files) => {
    if (!user) return
    setDroppedFiles(files)
    setIsUploadModalOpen(true)
  }, [user])

  const { isDragging } = useGlobalDragDrop(handleDrop)

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleClearDroppedFiles = useCallback(() => {
    setDroppedFiles(null)
  }, [])

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {user && <DragOverlay isDragging={isDragging} />}

      <Navbar onUploadClick={() => setIsUploadModalOpen(true)} />

      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" replace />} />
        <Route path="/shared/:shareId" element={<SharedGallery />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Gallery refreshTrigger={refreshTrigger} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        droppedFiles={droppedFiles}
        onClearDroppedFiles={handleClearDroppedFiles}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
