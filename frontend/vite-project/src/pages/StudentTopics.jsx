import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../services/api'
import { 
  Eye, Youtube, Globe, CheckCircle, BookOpen, Award, 
  ArrowLeft, TrendingUp, Clock, FileText, PlayCircle,
  Target, Zap, ChevronRight, Star, Download
} from 'lucide-react'

function StudentTopics() {
  const { subjectId } = useParams()
  const navigate = useNavigate()

  const [topics, setTopics] = useState([])
  const [completedTopics, setCompletedTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [subjectName, setSubjectName] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const [topicsRes, progressRes, subjectRes] = await Promise.all([
        API.get(`/api/topics/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        API.get('/api/progress', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        API.get(`/api/subjects/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { name: 'Subject' } }))
      ])

      setTopics(topicsRes.data)
      setCompletedTopics(progressRes.data.map(p => p.topic))
      setSubjectName(subjectRes.data?.name || 'Subject')
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const toggleComplete = async (topicId) => {
    const token = localStorage.getItem('token')

    try {
      await API.post(
        '/api/progress/toggle',
        { topicId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      fetchData()
    } catch (error) {
      console.error('Error toggling completion:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [subjectId])

  // Subject-wise progress calculation
  const subjectTopicIds = topics.map(t => t._id)
  const completedInThisSubject = completedTopics.filter(topicId =>
    subjectTopicIds.includes(topicId)
  )
  const completionPercentage =
    topics.length > 0
      ? Math.round((completedInThisSubject.length / topics.length) * 100)
      : 0

  const getProgressColor = () => {
    if (completionPercentage >= 80) return 'from-green-500 to-emerald-600'
    if (completionPercentage >= 50) return 'from-blue-500 to-indigo-600'
    if (completionPercentage >= 25) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading topics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{subjectName}</h1>
                  <p className="text-sm text-gray-600">
                    {topics.length} {topics.length === 1 ? 'Topic' : 'Topics'} • {completedInThisSubject.length} Completed
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">Your Progress</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {completionPercentage}%
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="transform -rotate-90 w-16 h-16">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${completionPercentage * 1.76} 176`}
                    className="text-blue-600 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Learning Progress</h3>
                <p className="text-blue-100 text-sm">
                  Keep going! You've completed {completedInThisSubject.length} out of {topics.length} topics
                </p>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{completionPercentage}%</div>
                  <div className="text-blue-100 text-xs">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{topics.length - completedInThisSubject.length}</div>
                  <div className="text-blue-100 text-xs">Remaining</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 rounded-full shadow-lg`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-4">
          {topics.map((topic, index) => {
            const isCompleted = completedTopics.includes(topic._id)
            const hasResources = (topic.articleLinks?.length > 0) || 
                                (topic.youtubeLinks?.length > 0) || 
                                topic.notesFile

            return (
              <div
                key={topic._id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border ${
                  isCompleted 
                    ? 'border-green-500 bg-green-50/30' 
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <div className="p-4">
                  {/* Topic Header */}
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Number + Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Topic Number Badge */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                      </div>

                      {/* Topic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{topic.title}</h3>
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex-shrink-0">
                              <CheckCircle className="h-3 w-3" />
                              Done
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Complete Button */}
                    <button
                      onClick={() => toggleComplete(topic._id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white border border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {isCompleted ? '✓' : 'Complete'}
                    </button>
                  </div>

                  {/* Resources - Compact Inline Layout */}
                  {hasResources && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 ml-13">
                      {/* Article Links */}
                      {topic.articleLinks?.map((link, i) => (
                        <a
                          key={`article-${i}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 text-sm group"
                        >
                          <Globe className="h-3.5 w-3.5 text-blue-600" />
                          <span className="text-blue-700 font-medium">Article {i + 1}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}

                      {/* YouTube Links */}
                      {topic.youtubeLinks?.map((link, i) => (
                        <a
                          key={`video-${i}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200 text-sm group"
                        >
                          <PlayCircle className="h-3.5 w-3.5 text-red-600" />
                          <span className="text-red-700 font-medium">Video {i + 1}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}

                      {/* Notes File */}
                      {topic.notesFile && (
                        <button
                          onClick={() => window.open(`http://localhost:5000/${topic.notesFile}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all duration-200 text-sm group"
                        >
                          <FileText className="h-3.5 w-3.5 text-purple-600" />
                          <span className="text-purple-700 font-medium">Notes</span>
                          <Download className="h-3.5 w-3.5 text-purple-500 group-hover:translate-y-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {topics.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Topics Yet</h3>
            <p className="text-gray-600 mb-6">
              Topics will appear here once your teacher adds them
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
          </div>
        )}

        {/* Motivational Footer */}
        {topics.length > 0 && completionPercentage === 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              🎉 Congratulations! 🎉
            </h3>
            <p className="text-green-50 text-lg">
              You've completed all topics in this subject!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentTopics