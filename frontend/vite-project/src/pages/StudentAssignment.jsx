// Frontend/src/pages/StudentAssignments.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { ClipboardList, Calendar, Link as LinkIcon, CheckCircle } from 'lucide-react'

function StudentAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [link, setLink] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      const res = await API.get('/api/assignments/student-assignments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setAssignments(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (assignmentId) => {
    if (!link.trim()) {
      alert('Please enter submission link')
      return
    }

    try {
      await API.post(`/api/assignments/${assignmentId}/submit`, 
        { submissionLink: link, message },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      )
      
      alert('Assignment submitted successfully!')
      setLink('')
      setMessage('')
      setSubmitting(null)
      loadAssignments()
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed')
    }
  }

  const isOverdue = (dueDate) => new Date(dueDate) < new Date()

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Assignments</h1>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold">{assignment.title}</h3>
                <p className="text-gray-600 mt-2">{assignment.description}</p>
                {assignment.assignmentDriveLink && (
                  <a
                    href={assignment.assignmentDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-2"
                  >
                    <LinkIcon className="w-4 h-4" />
                    View assignment materials
                  </a>
                )}
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due: {new Date(assignment.dueDate).toLocaleString()}
                  </span>
                  {isOverdue(assignment.dueDate) && (
                    <span className="text-red-600 font-medium">Overdue</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  By {assignment.createdBy.name}
                </p>
              </div>

              {assignment.hasSubmitted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">Submitted</span>
                </div>
              ) : (
                <button
                  onClick={() => setSubmitting(assignment._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              )}
            </div>

            {assignment.hasSubmitted && assignment.submission && (
              <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-800 mb-1">
                  Submitted on: {new Date(assignment.submission.submittedAt).toLocaleString()}
                </p>
                <p className={`text-sm font-medium mb-1 ${
                  assignment.submission.grade ? 'text-blue-700' : 'text-amber-700'
                }`}>
                  {assignment.submission.grade ? `Marks: ${assignment.submission.grade}` : 'Marks: Pending'}
                </p>
                <a
                  href={assignment.submission.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                  <LinkIcon className="w-4 h-4" />
                  View your submission
                </a>
              </div>
            )}

            {submitting === assignment._id && (
              <div className="mt-4 p-4 border-t">
                <h4 className="font-semibold mb-3">Submit Assignment</h4>
                <div className="space-y-3">
                  <input
                    type="url"
                    placeholder="Paste your submission link (Google Drive, GitHub, etc.)"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    placeholder="Optional message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmit(assignment._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setSubmitting(null)
                        setLink('')
                        setMessage('')
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No assignments yet
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAssignments;
