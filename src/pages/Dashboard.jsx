import { useEffect, useState } from 'react'
import { fetchUserPhotos } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, HardDrive, Image as ImageIcon } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalSize: 0,
    loading: true
  })

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        const photos = await fetchUserPhotos(user.id)
        const totalPhotos = photos.length
        // Assuming size is not currently stored, but if it were:
        // const totalSize = photos.reduce((acc, photo) => acc + (photo.size || 0), 0)
        // Since we don't track size yet, we'll keep it as 0 or unknown.
        const totalSize = 0

        setStats({
          totalPhotos,
          totalSize,
          loading: false
        })
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    loadStats()
  }, [user])

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Photos Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ImageIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Photos</dt>
                    <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{stats.totalPhotos}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HardDrive className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Estimated Storage</dt>
                    <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalSize > 0 ? `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                    </dd>
                    <dd className="text-xs text-gray-500 dark:text-gray-500 mt-1">Storage tracking not enabled</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <div className="text-sm">
                   <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                   </div>
                   <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">0% used of 1GB (Mock Limit)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
