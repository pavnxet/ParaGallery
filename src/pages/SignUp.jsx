import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Check, X } from 'lucide-react'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Password requirements validation
  const validatePassword = (pwd) => {
    const requirements = {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
    
    const allMet = Object.values(requirements).every(req => req)
    return { requirements, allMet }
  }

  const passwordValidation = validatePassword(password)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== passwordConfirm) {
      return setError('Passwords do not match')
    }

    if (!passwordValidation.allMet) {
      const missingReqs = []
      if (!passwordValidation.requirements.minLength) missingReqs.push('at least 8 characters')
      if (!passwordValidation.requirements.hasUppercase) missingReqs.push('one uppercase letter')
      if (!passwordValidation.requirements.hasLowercase) missingReqs.push('one lowercase letter')
      if (!passwordValidation.requirements.hasNumber) missingReqs.push('one number')
      if (!passwordValidation.requirements.hasSpecial) missingReqs.push('one special character')
      
      return setError(`Password must contain: ${missingReqs.join(', ')}`)
    }

    try {
      setError('')
      setLoading(true)
      const { error } = await signUp(email, password)
      if (error) throw error
      navigate('/')
    } catch (error) {
      setError('Failed to create an account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Create your account
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
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* Password Requirements */}
            {password && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center ${passwordValidation.requirements.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {passwordValidation.requirements.minLength ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    At least 8 characters
                  </li>
                  <li className={`flex items-center ${passwordValidation.requirements.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {passwordValidation.requirements.hasUppercase ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    One uppercase letter
                  </li>
                  <li className={`flex items-center ${passwordValidation.requirements.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {passwordValidation.requirements.hasLowercase ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    One lowercase letter
                  </li>
                  <li className={`flex items-center ${passwordValidation.requirements.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {passwordValidation.requirements.hasNumber ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    One number
                  </li>
                  <li className={`flex items-center ${passwordValidation.requirements.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {passwordValidation.requirements.hasSpecial ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    One special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password-confirm" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
            {passwordConfirm && password !== passwordConfirm && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
            )}
            {passwordConfirm && password === passwordConfirm && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">Passwords match</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !passwordValidation.allMet || password !== passwordConfirm}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp
