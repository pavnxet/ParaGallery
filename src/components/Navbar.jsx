import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Upload, Search, Grid, Album, Heart, Sun, Moon, LayoutDashboard } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const Navbar = ({ onUploadClick, searchTerm, onSearchChange, activeView, onViewChange }) => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
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

                <Link
                  to="/dashboard"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Dashboard"
                >
                   <LayoutDashboard className="h-5 w-5" />
                </Link>

                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <button
                  onClick={onUploadClick}
                  className="ui-btn-upload"
                  title="Upload Photo"
                >
                  <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="text">
                    Upload
                  </span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="ui-btn-logout"
                  title="Sign Out"
                >
                  <div className="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
                  <div className="text">Logout</div>
                </button>
              </>
            ) : (
              <div className="flex gap-4 items-center">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
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
