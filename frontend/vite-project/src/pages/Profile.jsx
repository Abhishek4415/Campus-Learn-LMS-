import { useEffect, useState } from 'react'
import API from '../services/api'
import { UserCircle, Mail, BadgeInfo, GraduationCap, School, Phone } from 'lucide-react'

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await API.get('/api/auth/profile')
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-section p-8 text-center text-slate-600">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-section p-8 text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-section max-w-4xl mx-auto overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-cyan-600 px-6 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-2 rounded-lg">
              <UserCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-blue-100 text-sm">Your account and academic details</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Full Name</p>
              <p className="text-base font-semibold text-slate-900">{user?.fullName || user?.name || '-'}</p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                Email
              </p>
              <p className="text-base font-semibold text-slate-900 break-all">{user?.email || '-'}</p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <BadgeInfo className="w-3.5 h-3.5" />
                Role
              </p>
              <p className="text-base font-semibold text-slate-900 capitalize">{user?.role || '-'}</p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5" />
                School
              </p>
              <p className="text-base font-semibold text-slate-900">{user?.school || user?.collegeName || '-'}</p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Department
              </p>
              <p className="text-base font-semibold text-slate-900">{user?.department || '-'}</p>
            </div>

            {user?.role === 'student' && (
              <>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-500 mb-1">Passing Year</p>
                  <p className="text-base font-semibold text-slate-900">{user?.passingYear || user?.year || '-'}</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-500 mb-1">Section</p>
                  <p className="text-base font-semibold text-slate-900">{user?.section || '-'}</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-500 mb-1">Roll Number</p>
                  <p className="text-base font-semibold text-slate-900">{user?.rollNumber || '-'}</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Phone
                  </p>
                  <p className="text-base font-semibold text-slate-900">{user?.phoneNumber || '-'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
