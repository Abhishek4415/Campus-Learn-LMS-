import { useEffect, useState } from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'
import { 
  BookOpen, Award, Download, TrendingUp, CheckCircle, 
  Clock, Target, Sparkles, ChevronRight, Star
} from 'lucide-react'

function StudentSubjects() {
  const [subjects, setSubjects] = useState([])
  const [topicsBySubject, setTopicsBySubject] = useState({})
  const [completedTopics, setCompletedTopics] = useState([])
  const [downloadingId, setDownloadingId] = useState(null)
  const [loading, setLoading] = useState(true)

  const downloadCertificate = async (subjectId, subjectTitle) => {
    try {
      setDownloadingId(subjectId)

      const res = await API.get(`/api/certificate/${subjectId}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${subjectTitle}-certificate.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to download certificate')
    } finally {
      setDownloadingId(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [subjectsRes, progressRes] = await Promise.all([
          API.get('/api/subjects', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          API.get('/api/progress', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ])

        setCompletedTopics(progressRes.data.map(p => p.topic))
        setSubjects(subjectsRes.data)

        // Fetch topics for each subject
        const topicsPromises = subjectsRes.data.map(s =>
          API.get(`/api/topics/${s._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        )

        const topicsResults = await Promise.all(topicsPromises)
        
        const topicsMap = {}
        subjectsRes.data.forEach((s, index) => {
          topicsMap[s._id] = topicsResults[index].data
        })
        
        setTopicsBySubject(topicsMap)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getProgress = (subjectId) => {
    const topics = topicsBySubject[subjectId] || []
    if (topics.length === 0) return 0

    const completed = topics.filter(t =>
      completedTopics.includes(t._id)
    ).length

    return Math.round((completed / topics.length) * 100)
  }

  const getTotalProgress = () => {
    if (subjects.length === 0) return 0
    const total = subjects.reduce((sum, s) => sum + getProgress(s._id), 0)
    return Math.round(total / subjects.length)
  }

  const getCompletedCount = () => {
    return subjects.filter(s => getProgress(s._id) === 100).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading subjects...</p>
        </div>
      </div>
    )
  }

  const subjectIcons = [
    { icon: BookOpen, color: 'from-orange-500 to-red-500' },
    { icon: Target, color: 'from-yellow-500 to-orange-500' },
    { icon: Award, color: 'from-purple-500 to-pink-500' },
    { icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { icon: Sparkles, color: 'from-blue-500 to-indigo-500' },
    { icon: Star, color: 'from-pink-500 to-rose-500' },
    { icon: CheckCircle, color: 'from-teal-500 to-cyan-500' },
    { icon: Clock, color: 'from-indigo-500 to-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 ">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Subjects</h1>
              <p className="text-gray-600">Track your progress across all subjects</p>
            </div>

            {subjects.length > 0 && (
              <div className="hidden md:flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {getTotalProgress()}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {getCompletedCount()}/{subjects.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{getCompletedCount()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalProgress()}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((s, index) => {
            const iconData = subjectIcons[index % subjectIcons.length]
            const Icon = iconData.icon
            const progress = getProgress(s._id)
            const isCompleted = progress === 100
            const topics = topicsBySubject[s._id] || []

            return (
              <div key={s._id} className="group">
                <Link
                  to={`/student/subjects/${s._id}`}
                  className="block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300"
                >
                  {/* Icon Header */}
                  <div className={`bg-gradient-to-br ${iconData.color} p-8 relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white"></div>
                      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white"></div>
                    </div>

                    {/* Icon */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Completion Badge */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-bold text-gray-900">100%</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {s.title}
                    </h3>

                    {s.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {s.description}
                      </p>
                    )}

                    {/* Topics Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <BookOpen className="h-4 w-4" />
                      <span>{topics.length} {topics.length === 1 ? 'Topic' : 'Topics'}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 font-medium">Progress</span>
                        <span className={`font-bold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-semibold group-hover:text-blue-700 flex items-center gap-1">
                        View Topics
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Download Certificate Button */}
                {isCompleted && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      downloadCertificate(s._id, s.title)
                    }}
                    disabled={downloadingId === s._id}
                    className={`mt-3 w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                      downloadingId === s._id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg'
                    }`}
                  >
                    {downloadingId === s._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download Certificate
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {subjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Subjects Yet</h3>
            <p className="text-gray-600 mb-6">
              Subjects will appear here once your teacher adds them
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Track your progress</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Earn certificates</span>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Banner */}
        {/* {subjects.length > 0 && getCompletedCount() > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Award className="h-8 w-8 text-white" />
              <h3 className="text-2xl font-bold text-white">
                {getCompletedCount()} {getCompletedCount() === 1 ? 'Subject' : 'Subjects'} Completed!
              </h3>
            </div>
            <p className="text-green-50">
              Keep up the great work! You're making excellent progress.
            </p>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default StudentSubjects