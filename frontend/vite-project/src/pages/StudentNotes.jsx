import { useEffect, useState } from 'react'
import API from '../services/api'
import { Search, FileText, Download,Calendar, Filter, BookOpen, User, Eye, Star, TrendingUp, GraduationCap, School } from 'lucide-react'

function StudentNotes() {
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const fetchAllNotes = async () => {
      try {
        const res = await API.get('/api/notes/all-notes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setNotes(res.data)
        setFilteredNotes(res.data)
        
        // Load favorites from localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('favoritesNotes') || '[]')
        setFavorites(savedFavorites)
      } catch (error) {
        console.log(error)
        // Fallback: try to fetch from notes endpoint
        try {
          const res = await API.get('/api/notes', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          setNotes(res.data)
          setFilteredNotes(res.data)
        } catch (err) {
          console.log('Could not fetch notes:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAllNotes()
  }, [])

  useEffect(() => {
    let filtered = notes

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter(note => note.subject === selectedSubject)
    }

    // Filter by semester
    if (selectedSemester) {
      filtered = filtered.filter(note => note.semester === parseInt(selectedSemester))
    }

    // Filter by batch
    if (selectedBatch) {
      filtered = filtered.filter(note => note.batch === selectedBatch)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'favorites':
          return favorites.includes(b._id) ? 1 : -1
        default:
          return 0
      }
    })

    setFilteredNotes(filtered)
  }, [searchTerm, selectedSubject, selectedSemester, selectedBatch, sortBy, notes, favorites])

  const subjects = [...new Set(notes.map(note => note.subject))]
  const semesters = [...new Set(notes.map(note => note.semester).filter(Boolean))]
  const batches = [...new Set(notes.map(note => note.batch).filter(Boolean))]

  const toggleFavorite = (noteId) => {
    const updated = favorites.includes(noteId)
      ? favorites.filter(id => id !== noteId)
      : [...favorites, noteId]
    setFavorites(updated)
    localStorage.setItem('favoritesNotes', JSON.stringify(updated))
  }

  const handleDownload = (fileUrl, noteTitle) => {
    const link = document.createElement('a')
    link.href = `http://localhost:5000/${fileUrl}`
    link.download = `${noteTitle}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Browse and access study notes from your teachers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or subject..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Subject Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">All Semesters</option>
                {semesters.sort((a, b) => a - b).map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">All Batches</option>
                {batches.sort().map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="favorites">Favorites First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {notes.length === 0 ? 'No notes available yet' : 'No notes found'}
            </h3>
            <p className="text-gray-600">
              {notes.length === 0
                ? 'Check back soon for study materials from your teachers'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div
                key={note._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header with Badge */}
                <div className="p-6 border-b border-gray-100 relative">
                  <button
                    onClick={() => toggleFavorite(note._id)}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 ${
                      favorites.includes(note._id)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
                    }`}
                  >
                    <Star className="h-5 w-5" fill={favorites.includes(note._id) ? 'currentColor' : 'none'} />
                  </button>

                  <div className="pr-10">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {note.title}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="font-medium">{note.subject}</span>
                      </div>

                      {note.uploadedBy && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{note.uploadedBy.name || 'Teacher'}</span>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{new Date(note.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <a
                    href={`http://localhost:5000/${note.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </a>

                  <button
                    onClick={() => handleDownload(note.fileUrl, note.title)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50"
                    title="Download note"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {filteredNotes.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredNotes.length} of {notes.length} notes
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentNotes
