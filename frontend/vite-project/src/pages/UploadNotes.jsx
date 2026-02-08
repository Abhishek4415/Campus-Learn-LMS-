import { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, BookOpen, CheckCircle, X, AlertCircle } from 'lucide-react'

function UploadNotes() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [school, setSchool] = useState('')
  const [batch, setBatch] = useState('')
  const [semester, setSemester] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!file) {
      setMessage('Please select a PDF file')
      return
    }

    if (!title.trim() || !subject.trim() || !school.trim() || !batch.trim() || !semester) {
      setMessage('Please fill in all fields')
      return
    }

    setIsUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('subject', subject.trim())
    formData.append('school', school.trim())
    formData.append('batch', batch.trim())
    formData.append('semester', semester)
    formData.append('file', file)

    try {
      await API.post('/api/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      setMessage('Notes uploaded successfully!')
      setTitle('')
      setSubject('')
      setSchool('')
      setBatch('')
      setSemester('')
      setFile(null)

      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/managenotes')
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setMessage(error.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
      } else {
        setMessage('Please select a valid PDF file')
      }
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
  }

const subjects = [
  'Engineering Mathematics',
  'Discrete Mathematics',
  'Probability and Statistics',

  'Programming Fundamentals',
  'Data Structures and Algorithms',
  'Object Oriented Programming',
  'Operating Systems',
  'Database Management Systems',
  'Computer Networks',
  'Software Engineering',

  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Data Science',
  'Natural Language Processing',
  'Computer Vision',

  'Web Development',
  'Cloud Computing',
  'Cyber Security',
  'Blockchain',

  'Compiler Design',
  'Theory of Computation',

  'Other'
]


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Upload className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Upload Notes</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your knowledge by uploading study materials for students to access and learn from.
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleUpload} className="p-8">
            {/* Title Input */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Note Title *
              </label>
              <input
                type="text"
                id="title"
                placeholder="e.g., Introduction to Calculus"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>

            {/* Subject Selection */}
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                disabled={isUploading}
              >
                <option value="">Select a subject</option>
                {subjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            {/* School Name Input */}
            <div className="mb-6">
              <label htmlFor="school" className="block text-sm font-semibold text-gray-700 mb-2">
                School Name *
              </label>
              <input
                type="text"
                id="school"
                placeholder="e.g., SOET,SOMC"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>

            {/* Batch Selection */}
            <div className="mb-6">
              <label htmlFor="batch" className="block text-sm font-semibold text-gray-700 mb-2">
                Passout Batch *
              </label>
              <select
                id="batch"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                required
                disabled={isUploading}
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
            <div className="mb-6">
              <label htmlFor="semester" className="block text-sm font-semibold text-gray-700 mb-2">
                Semester *
              </label>
              <select
                id="semester"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
                disabled={isUploading}
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

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PDF File *
              </label>

              {!file ? (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your PDF file here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold">
                      browse
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Only PDF files are supported (Max size: 10MB)
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-900">{file.name}</p>
                        <p className="text-sm text-green-700">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1 text-green-600 hover:text-red-600 transition-colors"
                      disabled={isUploading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center ${
                message.includes('successfully')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.includes('successfully') ? (
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !file || !title.trim() || !subject.trim() || !school.trim() || !batch.trim() || !semester}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${
                isUploading || !file || !title.trim() || !subject.trim() || !school.trim() || !batch.trim() || !semester
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-3" />
                  Upload Notes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Upload Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure your PDF is clear and readable</li>
                <li>• Use descriptive titles that help students understand the content</li>
                <li>• Check that the file size is under 10MB</li>
                <li>• Make sure the content is appropriate for educational purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadNotes
