import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Upload, Search, Grid, Album, Heart } from 'lucide-react'

const Navbar = ({ onUploadClick, searchTerm, onSearchChange, activeView, onViewChange }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row h-auto sm:h-16 justify-between items-center py-2 sm:py-0 gap-4 sm:gap-0">
          <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 mr-6">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">ParaGallery</span>
            </Link>
          </div>

          {user && (
            <div className="flex flex-1 items-center justify-center max-w-lg w-full px-2">
               <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                    placeholder="Search photos..."
                  />
                </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => onViewChange('all')}
                        className={`p-2 rounded-md ${activeView === 'all' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        title="All Photos"
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onViewChange('albums')}
                        className={`p-2 rounded-md ${activeView === 'albums' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        title="Albums"
                    >
                        <Album className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onViewChange('favorites')}
                        className={`p-2 rounded-md ${activeView === 'favorites' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        title="Favorites"
                    >
                        <Heart className="h-4 w-4" />
                    </button>
                </div>

                <button
                  onClick={onUploadClick}
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200">
                  Log in
                </Link>
                <Link to="/signup" className="text-sm font-semibold leading-6 text-indigo-600 dark:text-indigo-400">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
