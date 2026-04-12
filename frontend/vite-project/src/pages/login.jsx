import { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ShieldCheck } from 'lucide-react'

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
    <div className="auth-shell">
      <div className="auth-grid">
        <aside className="auth-panel">
          <div className="flex items-center gap-2 text-white/95">
            <BookOpen className="w-6 h-6" />
            <span className="text-lg font-semibold">CampusLearn</span>
          </div>
          <h1 className="mt-8 text-3xl font-bold leading-tight">
            Learn Smarter.
            <br />
            Grow Faster.
          </h1>
          <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-sm">
            Access notes, assignments, group learning, and analytics in one focused learning workspace.
          </p>
          <div className="mt-8 rounded-xl bg-white/15 border border-white/25 p-4 text-sm text-white/95 flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 mt-0.5" />
            Secure login and role-based access for students and faculty.
          </div>
        </aside>

        <div className="auth-card">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-600 mt-1">
              Sign in to continue to your learning dashboard.
            </p>
          </div>

          <div className="form-field mt-0">
            <label className="form-label">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email.trim() || !password.trim()}
            className="btn-primary mt-5"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm text-center font-medium border mt-4 ${
                message.toLowerCase().includes('successful')
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center text-sm text-slate-600 pt-4">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-700 font-semibold hover:underline"
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
