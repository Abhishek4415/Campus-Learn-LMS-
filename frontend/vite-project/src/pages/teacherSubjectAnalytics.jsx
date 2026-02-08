import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import API from '../services/api'
import { Users, TrendingUp, Award } from 'lucide-react'

function TeacherSubjectAnalytics() {
  const { subjectId } = useParams()
  const [students, setStudents] = useState([])
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.percent, 0) / students.length)
    : 0

  const getProgressBadge = (percent) => {
    if (percent >= 80) return { icon: Award, text: 'Excellent', color: 'text-green-600 bg-green-50' }
    if (percent >= 60) return { icon: TrendingUp, text: 'Good', color: 'text-blue-600 bg-blue-50' }
    if (percent >= 40) return { icon: TrendingUp, text: 'Fair', color: 'text-yellow-600 bg-yellow-50' }
    return { icon: TrendingUp, text: 'Needs Help', color: 'text-red-600 bg-red-50' }
  }
  const getProgressColor = (percent) => {
    if (percent >= 80) return 'from-green-500 to-emerald-600'
    if (percent >= 60) return 'from-blue-500 to-indigo-600'
    if (percent >= 40) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }
  useEffect(() => {
    API.get(`/api/analytics/subject/${subjectId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setStudents(res.data))
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Users className="h-9 w-9 text-indigo-600" />
            Student Progress
          </h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-indigo-100">
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-indigo-600">{students.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-purple-100">
              <p className="text-sm font-semibold text-gray-500 mb-1">Average Progress</p>
              <p className="text-3xl font-bold text-purple-600">{avgProgress}%</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-pink-100">
              <p className="text-sm font-semibold text-gray-500 mb-1">High Performers</p>
              <p className="text-3xl font-bold text-pink-600">
                {students.filter(s => s.percent >= 80).length}
              </p>
            </div>
          </div>
        </div>

        {students.length === 0 && (
          <div className="bg-white p-12 rounded-2xl shadow-lg text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No students enrolled yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {students.map((s, index) => {
            const badge = getProgressBadge(s.percent)
            const BadgeIcon = badge.icon

            return (
              <div
                key={s.studentId}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-[1.01] group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-800 block">{s.name}</span>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color} mt-1`}>
                        <BadgeIcon className="h-3 w-3" />
                        {badge.text}
                      </div>
                    </div>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {s.percent}%
                  </span>
                </div>

                <div className="relative">
                  <div className="bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`bg-gradient-to-r ${getProgressColor(s.percent)} h-3 rounded-full transition-all duration-700 ease-out shadow-md relative overflow-hidden`}
                      style={{ width: `${s.percent}%` }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                  {/* Milestone markers */}
                  <div className="absolute top-4 w-full flex justify-between text-xs text-gray-400 font-medium">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TeacherSubjectAnalytics
