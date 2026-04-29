import { useEffect, useMemo, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, MailCheck, UserCog } from 'lucide-react'

function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [collegeName, setCollegeName] = useState('KR Mangalam University')
  const [school, setSchool] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [section, setSection] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const [message, setMessage] = useState('')
  const [isSuccessMessage, setIsSuccessMessage] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [registering, setRegistering] = useState(false)
  const navigate = useNavigate()

  const yearOptions = [2026, 2027, 2028, 2029, 2030]
  const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const schoolOptions = ['SOET', 'SOMC', 'SOB', 'SOL', 'SOP', 'SOAHS']
  const emailRegex = /^\d{10}@krmu\.edu\.in$/i
  const generalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const rollRegex = /^\d{10}$/

  const loading = sendingOtp || verifyingOtp || registering
  const canResend = otpSent && cooldownSeconds <= 0 && !otpVerified && !sendingOtp

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const identityKey = useMemo(() => {
    return `${role}|${email.trim().toLowerCase()}|${rollNumber.trim()}|${fullName.trim()}`
  }, [role, email, rollNumber, fullName])

  useEffect(() => {
    setOtp('')
    setOtpToken('')
    setOtpVerified(false)
    setOtpSent(false)
    setCooldownSeconds(0)
  }, [identityKey])

  const setError = (text) => {
    setIsSuccessMessage(false)
    setMessage(text)
  }

  const setSuccess = (text) => {
    setIsSuccessMessage(true)
    setMessage(text)
  }

  const validateBaseInputs = () => {
    if (!fullName.trim()) return 'Full name is required'
    if (!email.trim()) return 'Email must not be empty'
    if (role === 'student' && !emailRegex.test(email.trim())) return 'Email must be in the format rollno@krmu.edu.in'
    if (role === 'teacher' && !generalEmailRegex.test(email.trim())) return 'Please enter a valid email address'
    if (!password || password.length < 6) return 'Password must be at least 6 characters'
    if (!school) return 'School is required'
    if (!department) return 'Department is required'
    if (role === 'student') {
      if (!year) return 'Year is required'
      if (!rollNumber.trim()) return 'Roll number must not be empty'
      if (!rollRegex.test(rollNumber.trim())) return 'Roll number must be exactly 10 digits'
      if (email.split('@')[0] !== rollNumber.trim()) return 'Roll number must match email prefix'
      if (!section) return 'Section is required'
      if (!phoneNumber.trim()) return 'Phone number is required'
      if (!rollRegex.test(phoneNumber.trim())) return 'Phone number must be exactly 10 digits'
    }
    return ''
  }

  const buildRegisterPayload = () => {
    const registerPayload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      school,
      department,
      role,
      otpToken
    }

    if (role === 'student') {
      registerPayload.collegeName = collegeName
      registerPayload.year = Number(year)
      registerPayload.rollNumber = rollNumber.trim()
      registerPayload.section = section
      registerPayload.phoneNumber = phoneNumber.trim()
    }

    return registerPayload
  }

  const handleSendOtp = async () => {
    const validationMessage = validateBaseInputs()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    try {
      setSendingOtp(true)
      setMessage('')
      const payload = buildRegisterPayload()
      await API.post('/api/auth/register/send-otp', payload)
      setOtpSent(true)
      setOtpVerified(false)
      setOtpToken('')
      setCooldownSeconds(30)
      setSuccess('OTP sent to your email.')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpSent) {
      setError('Please send OTP first')
      return
    }
    if (!otp.trim()) {
      setError('Please enter OTP')
      return
    }

    try {
      setVerifyingOtp(true)
      setMessage('')
      const response = await API.post('/api/auth/register/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      })
      setOtpToken(response.data.otpToken || '')
      setOtpVerified(true)
      setSuccess('OTP verified successfully. You can complete registration now.')
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleRegister = async () => {
    const validationMessage = validateBaseInputs()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    if (!otpVerified || !otpToken) {
      setError('Please verify OTP before registration')
      return
    }

    try {
      setRegistering(true)
      setMessage('')
      const registerPayload = buildRegisterPayload()

      const response = await API.post('/api/auth/register', registerPayload)

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      setSuccess('Registration successful! Redirecting...')

      setTimeout(() => {
        navigate(role === 'teacher' ? '/teacher-groups' : '/student-groups')
      }, 1200)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <aside className="auth-panel">
          <div className="flex items-center gap-2 text-white/95">
            <GraduationCap className="w-6 h-6" />
            <span className="text-lg font-semibold">CampusLearn</span>
          </div>
          <h1 className="mt-8 text-3xl font-bold leading-tight">
            Create your account
            <br />
            and start learning.
          </h1>
          <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-sm">
            Role-based onboarding keeps your learning space secure and organized.
          </p>
          <div className="mt-8 rounded-xl bg-white/15 border border-white/25 p-4 text-sm text-white/95 flex items-start gap-2">
            <MailCheck className="w-5 h-5 mt-0.5" />
            Verify your email with OTP before final account creation.
          </div>
        </aside>

        <div className="auth-card">
          <div className="mb-5">
            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="text-sm text-slate-600 mt-1">Simple, structured registration for students and teachers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder={role === 'teacher' ? 'teacher@school.com' : '1234567890@krmu.edu.in'}
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {role === 'student' && (
              <div className="sm:col-span-2">
                <label className="form-label">College Name</label>
                <select
                  className="form-select"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  disabled={loading}
                >
                  <option value="KR Mangalam University">KR Mangalam University</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              {role === 'teacher' ? 'Teacher Information' : 'Academic Information'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className={role === 'teacher' ? 'sm:col-span-2' : ''}>
                <label className="form-label">School</label>
                <select
                  className="form-select"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select School</option>
                  {schoolOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className={role === 'teacher' ? 'sm:col-span-2' : ''}>
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              {role === 'student' && (
                <>
                  <div>
                    <label className="form-label">Passing Year</label>
                    <select
                      className="form-select"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Passing Year</option>
                      {yearOptions.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10-digit roll number"
                      className="form-input"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="form-label">Section</label>
                    <select
                      className="form-select"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Section</option>
                      {sectionOptions.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10-digit phone number"
                      className="form-input"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || verifyingOtp || registering}
              className="btn-primary"
            >
              {sendingOtp ? 'Sending OTP...' : otpSent ? 'Send OTP Again' : 'Send OTP'}
            </button>

            {otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!canResend}
                className="btn-primary"
              >
                {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend OTP'}
              </button>
            )}
          </div>

          {otpSent && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="form-input sm:col-span-1"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={verifyingOtp || registering || otpVerified}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || registering || otpVerified}
                className="btn-primary"
              >
                {verifyingOtp ? 'Verifying...' : otpVerified ? 'OTP Verified' : 'Verify OTP'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleRegister}
            disabled={registering || !otpVerified || !otpToken}
            className="btn-primary mt-5"
          >
            {registering ? 'Creating Account...' : 'Register'}
          </button>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-center text-sm font-medium border ${
                isSuccessMessage
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <p className="text-center mt-5 text-sm text-slate-600">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-blue-700 font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
