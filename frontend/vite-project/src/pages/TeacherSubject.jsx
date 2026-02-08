import { useEffect, useState } from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'

function TeacherSubjects() {
  const [subjects, setSubjects] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const fetchSubjects = async () => {
    const res = await API.get('/api/subjects', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setSubjects(res.data)
  }

  const createSubject = async () => {
    if (!title) return

    await API.post(
      '/api/subjects',
      { title, description },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    setTitle('')
    setDescription('')
    fetchSubjects()
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 tracking-tight">My Subjects</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Create Subject Form */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100 backdrop-blur-sm bg-opacity-95">
          <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Create New Subject
          </h3>
          
          <div className="space-y-4">
            <input
              className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              placeholder="Subject Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <textarea
              className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 min-h-24 resize-y"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <button
              onClick={createSubject}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 w-full sm:w-auto"
            >
              Create Subject
            </button>
          </div>
        </div>

       {/* Subject List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((s, index) => {
            const gradients = [
              'from-orange-300 to-orange-400',
              'from-yellow-200 to-yellow-300',
              'from-purple-300 to-purple-400',
              'from-green-300 to-green-400',
              'from-blue-300 to-blue-400',
              'from-pink-300 to-pink-400',
              'from-teal-300 to-teal-400',
              'from-indigo-300 to-indigo-400'
            ]
            const gradient = gradients[index % gradients.length]
            
            return (
              <Link
                key={s._id}
                to={`/teacher/subjects/${s._id}`}
                className="group"
              >
                <div className="bg-gray-800 rounded-3xl p-5 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  {/* Icon Container */}
                  <div className={`bg-gradient-to-br ${gradient} rounded-3xl h-32 flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow duration-300`}>
                    <svg 
                      className="w-16 h-16 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                      />
                    </svg>
                  </div>
                  
                  {/* Subject Title */}
                  <h3 className="text-white text-xl font-semibold text-center group-hover:text-gray-100 transition-colors duration-200">
                    {s.title}
                  </h3>
                  
                  {/* Description (if exists) */}
                  {s.description && (
                    <p className="text-gray-400 text-sm text-center mt-2 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
        {/* Empty State */}
        {subjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No subjects yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first subject to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherSubjects