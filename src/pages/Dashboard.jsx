import { useState, useEffect } from 'react'
import { fetchUserStats } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, HardDrive, Image as ImageIcon, PieChart } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalCount: 0, totalSize: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchUserStats(user.id)
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadStats()
    }
  }, [user])

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Assume 1GB limit for visualization
  const STORAGE_LIMIT = 1024 * 1024 * 1024
  const usagePercent = Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Photo Count Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
            <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-4">
                <ImageIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Photos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCount}</p>
            </div>
        </div>

        {/* Storage Used Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                <HardDrive className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatSize(stats.totalSize)}</p>
            </div>
        </div>
      </div>

      {/* Storage Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Storage Usage
        </h2>
        <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{formatSize(stats.totalSize)} used</span>
            <span>{formatSize(STORAGE_LIMIT)} limit</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${usagePercent}%` }}
            ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
            {usagePercent.toFixed(1)}% used
        </p>
      </div>
    </div>
  )
}

export default Dashboard
