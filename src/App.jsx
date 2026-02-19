import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import UploadModal from './components/UploadModal'
import Gallery from './pages/Gallery'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { useGlobalDragDrop } from './hooks/useGlobalDragDrop'
import DragOverlay from './components/DragOverlay'
import './App.css'

function AppContent() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [droppedFiles, setDroppedFiles] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState('all') // 'all', 'albums', 'favorites'
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

      <Navbar
        onUploadClick={() => setIsUploadModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Gallery
                refreshTrigger={refreshTrigger}
                searchTerm={searchTerm}
                activeView={activeView}
                onViewChange={setActiveView}
              />
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
