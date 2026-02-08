import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../services/api'
import { BookOpen } from 'lucide-react'

function TeacherAnalytics() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/api/analytics/subject', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setSubjects(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    )
  }

 return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 flex items-center gap-3 text-gray-800">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          Subject Analytics
        </h2>

        {subjects.length === 0 && (
          <p className="text-gray-500 text-center py-8">No subjects found.</p>
        )}

        <div className="space-y-5">
          {subjects.map(subject => (
            <Link
              key={subject.subjectId}
              to={`/teacher/analytics/${subject.subjectId}`}
              className="block bg-white p-7 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {subject.subjectName}
                </h3>
                <span className="text-2xl font-bold text-indigo-600">
                  {subject.percent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${subject.percent}%` }}
                />
              </div>

              <p className="text-sm text-gray-600 mt-3 font-medium">
                Click to view student-wise progress →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherAnalytics
