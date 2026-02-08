import { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


function Login() {
  const navigate = useNavigate()


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

const handleLogin = async () => {
  try {
    setLoading(true)
    setMessage('')
    const res = await API.post('/api/auth/login', {
      email,
      password
    })

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))

    setMessage('Login successful')
    navigate('/dashboard')
  } catch (error) {
    setMessage(error?.response?.data?.message || 'Login failed. Please check your credentials.')
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to continue to CampusLearn
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email.trim() || !password.trim()}
            className={`w-full p-3 rounded-lg font-semibold transition-all duration-200 ${
              loading || !email.trim() || !password.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm text-center font-medium border ${
                message.toLowerCase().includes('successful')
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center text-sm text-gray-600 pt-2">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-600 font-semibold hover:underline"
              disabled={loading}
            >
              Create one
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login


// How this works (very simple)

// User types email and password

// Values are saved in React state

// User clicks Login button

// Data is sent to backend

// Backend checks user

// Response comes back

// Message is shown

//flow chart

// User → React → Axios → Express → MongoDB
//                               ↓
// User ← React ← Axios ← Express ← MongoDB
