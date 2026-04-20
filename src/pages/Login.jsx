import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LOGIN_ATTEMPTS_KEY = 'login_attempts'
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  
  const checkRateLimit = () => {
    const now = Date.now()
    const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '[]')
    
    // Filter out old attempts
    const recentAttempts = attempts.filter(timestamp => now - timestamp < LOCKOUT_DURATION_MS)
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = Math.min(...recentAttempts)
      const remainingTime = Math.ceil((LOCKOUT_DURATION_MS - (now - oldestAttempt)) / 60000)
      return { limited: true, remainingTime }
    }
    
    return { limited: false, attempts: recentAttempts }
  }
  
  const recordAttempt = (attempts) => {
    const now = Date.now()
    const newAttempts = [...attempts, now].filter(ts => now - ts < LOCKOUT_DURATION_MS)
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(newAttempts))
  }
  
  const clearAttempts = () => {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check rate limit
    const rateLimitResult = checkRateLimit()
    if (rateLimitResult.limited) {
      setError(`Too many failed login attempts. Please try again in ${rateLimitResult.remainingTime} minute(s).`)
      return
    }
    
    try {
      setError('')
      setLoading(true)
      const { error } = await signIn(email, password)
      
      if (error) {
        // Record failed attempt
        const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '[]')
        recordAttempt(attempts)
        throw error
      }
      
      // Clear attempts on successful login
      clearAttempts()
      navigate('/')
    } catch (error) {
      // Generic error message to prevent information disclosure
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link to="/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Start a 14 day free trial
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
