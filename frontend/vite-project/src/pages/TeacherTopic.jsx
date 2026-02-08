import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../services/api'
import { Eye, FileText, Youtube, Globe } from 'lucide-react'

function TeacherTopics() {
  const { subjectId } = useParams()

  const [topics, setTopics] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [articleLinks, setArticleLinks] = useState('')
  const [youtubeLinks, setYoutubeLinks] = useState('')
  const [notes, setNotes] = useState(null)

  // Fetch topics
  const fetchTopics = async () => {
    try {
      const res = await API.get(`/api/topics/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setTopics(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  // Create topic
  const createTopic = async () => {
    if (!title) return

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('subjectId', subjectId)
      formData.append('articleLinks', articleLinks)
      formData.append('youtubeLinks', youtubeLinks)

      if (notes) {
        formData.append('notes', notes)
      }

      await API.post('/api/topics', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      // reset form
      setTitle('')
      setDescription('')
      setArticleLinks('')
      setYoutubeLinks('')
      setNotes(null)

      fetchTopics()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 tracking-tight">Topics</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Create Topic Form */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100 backdrop-blur-sm bg-opacity-95">
          <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Create New Topic
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
                placeholder="Topic Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="relative">
              <textarea
                className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400 min-h-24 resize-y"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="relative">
              <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                className="border border-gray-300 p-3 pl-11 w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
                placeholder="Article links (comma separated)"
                value={articleLinks}
                onChange={(e) => setArticleLinks(e.target.value)}
              />
            </div>

            <div className="relative">
              <Youtube className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                className="border border-gray-300 p-3 pl-11 w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
                placeholder="YouTube links (comma separated)"
                value={youtubeLinks}
                onChange={(e) => setYoutubeLinks(e.target.value)}
              />
            </div>

            <div className="relative">
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all duration-200 cursor-pointer bg-gray-50 hover:bg-blue-50 group">
                <FileText className="h-5 w-5 text-gray-400 mr-2 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">
                  {notes ? notes.name : 'Upload PDF Notes'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNotes(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={createTopic}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 w-full sm:w-auto"
            >
              Add Topic
            </button>
          </div>
        </div>

        {/* Topic List */}
        <div className="space-y-5">
          {topics.map((t, index) => (
            <div
              key={t._id}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm bg-opacity-95"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-800 flex-1">
                  {t.title}
                </h3>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {index + 1}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-4">
                {t.description}
              </p>

              <div className="flex gap-3 flex-wrap pt-3 border-t border-gray-100">
                {t.youtubeLinks && (
                  <a
                    href={t.youtubeLinks}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:shadow-md transition-all duration-200 group"
                  >
                    <Youtube className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    YouTube
                  </a>
                )}

                {t.articleLinks && (
                  <a
                    href={t.articleLinks}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all duration-200 group"
                  >
                    <Globe className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Article
                  </a>
                )}

                {t.notesFile && (
                  <button
                    onClick={() => window.open(`http://localhost:5000/${t.notesFile}`, '_blank')}
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 hover:shadow-md transition-all duration-200 group"
                  >
                    <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    View Notes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {topics.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No topics yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first topic to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherTopics