import { useEffect, useState } from 'react'
import API from '../services/api'
import { Search, FileText, Eye, Edit, Trash2, BookOpen, User, X, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react'

function ManageNotes() {
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editSchool, setEditSchool] = useState('')
  const [editBatch, setEditBatch] = useState('')
  const [editSemester, setEditSemester] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editMessage, setEditMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await API.get('/api/notes/my-notes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setNotes(res.data)
        setFilteredNotes(res.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  useEffect(() => {
    let filtered = notes

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

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

    setFilteredNotes(filtered)
  }, [searchTerm, selectedSubject, selectedSemester, selectedBatch, notes])

  const subjects = [...new Set(notes.map(note => note.subject))]
  const semesters = [...new Set(notes.map(note => note.semester).filter(Boolean))]
  const batches = [...new Set(notes.map(note => note.batch).filter(Boolean))]

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await API.delete(`/api/notes/${noteId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setNotes(notes.filter(note => note._id !== noteId))
      } catch (error) {
        console.log(error)
        alert('Failed to delete note')
      }
    }
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    setEditTitle(note.title)
    setEditSubject(note.subject)
    setEditSchool(note.school || '')
    setEditBatch(note.batch || '')
    setEditSemester(note.semester || '')
    setShowEditModal(true)
    setEditMessage('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!editTitle.trim() || !editSubject.trim() || !editSchool.trim() || !editBatch.trim() || !editSemester) {
      setEditMessage('Please fill in all fields')
      return
    }

    setIsUpdating(true)
    setEditMessage('')

    try {
      const response = await API.put(`/api/notes/${editingNote._id}`, {
        title: editTitle.trim(),
        subject: editSubject.trim(),
        school: editSchool.trim(),
        batch: editBatch.trim(),
        semester: parseInt(editSemester)
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      // Update the note in the local state
      setNotes(notes.map(note =>
        note._id === editingNote._id
          ? { ...note, ...response.data.note }
          : note
      ))

      setEditMessage('Note updated successfully!')
      setTimeout(() => {
        setShowEditModal(false)
        setEditingNote(null)
      }, 1500)

    } catch (error) {
      console.error('Update error:', error)
      setEditMessage(error.response?.data?.message || 'Update failed. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingNote(null)
    setEditTitle('')
    setEditSubject('')
    setEditSchool('')
    setEditBatch('')
    setEditSemester('')
    setEditMessage('')
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Notes</h1>
          </div>
          <p className="text-gray-600">Organize and manage your uploaded study materials</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes by title or subject..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Subject Filter */}
            <div className="md:w-64">
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
            <div className="md:w-48">
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
            <div className="md:w-48">
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
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {notes.length === 0 ? 'No notes uploaded yet' : 'No notes found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {notes.length === 0
                ? 'Start by uploading your first study material'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {notes.length === 0 && (
              <button
                onClick={() => window.location.href = '/upload'}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <FileText className="h-5 w-5 mr-2" />
                Upload Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div
                key={note._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {note.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <BookOpen className="h-4 w-4 mr-1" />
                        <span>{note.subject}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        <span>{note.batch} • Semester {note.semester}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        <span>{note.school}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`http://localhost:5000/${note.fileUrl}`, '_blank')}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Uploaded on {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Stats Footer */}
        {filteredNotes.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredNotes.length} of {notes.length} notes
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Note</h2>
                <button
                  onClick={closeEditModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                {/* Title Input */}
                <div>
                  <label htmlFor="editTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                    Note Title *
                  </label>
                  <input
                    type="text"
                    id="editTitle"
                    placeholder="e.g., Introduction to Calculus"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    disabled={isUpdating}
                  />
                </div>

                {/* Subject Selection */}
                <div>
                  <label htmlFor="editSubject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="editSubject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    required
                    disabled={isUpdating}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* School Name Input */}
                <div>
                  <label htmlFor="editSchool" className="block text-sm font-semibold text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    id="editSchool"
                    placeholder="e.g., ABC School / IIT Delhi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    required
                    disabled={isUpdating}
                  />
                </div>

                {/* Batch Selection */}
                <div>
                  <label htmlFor="editBatch" className="block text-sm font-semibold text-gray-700 mb-2">
                    Passout Batch *
                  </label>
                  <select
                    id="editBatch"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    required
                    disabled={isUpdating}
                  >
                    <option value="">Select passout batch</option>
                    <option value="2023 Passout">2023 Passout</option>
                    <option value="2024 Passout">2024 Passout</option>
                    <option value="2025 Passout">2025 Passout</option>
                    <option value="2026 Passout">2026 Passout</option>
                    <option value="2027 Passout">2027 Passout</option>
                  </select>
                </div>

                {/* Semester Selection */}
                <div>
                  <label htmlFor="editSemester" className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester *
                  </label>
                  <select
                    id="editSemester"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                    required
                    disabled={isUpdating}
                  >
                    <option value="">Select semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>

                {/* Message Display */}
                {editMessage && (
                  <div className={`p-4 rounded-lg flex items-center ${
                    editMessage.includes('successfully')
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    {editMessage.includes('successfully') ? (
                      <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    )}
                    <span className="font-medium">{editMessage}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || !editTitle.trim() || !editSubject.trim() || !editSchool.trim() || !editBatch.trim() || !editSemester}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                      isUpdating || !editTitle.trim() || !editSubject.trim() || !editSchool.trim() || !editBatch.trim() || !editSemester
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Note'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageNotes
