// Frontend/src/pages/TeacherAssignments.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { ClipboardList, Calendar, Users, Eye, Trash2, Plus, ExternalLink } from 'lucide-react'

function TeacherAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      const res = await API.get('/api/assignments/my-assignments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setAssignments(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete all submissions too.')) {
      return
    }

    try {
      await API.delete(`/api/assignments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('Assignment deleted successfully')
      loadAssignments()
    } catch (err) {
      alert('Failed to delete assignment')
    }
  }

  const isOverdue = (dueDate) => new Date(dueDate) < new Date()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading assignments...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">My Assignments</h1>
        </div>
        <button
          onClick={() => navigate('/create-assignment')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Assignment
        </button>
      </div>

      {/* Assignments Grid */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No assignments yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first assignment to get started
          </p>
          <button
            onClick={() => navigate('/create-assignment')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const submissionRate = assignment.totalStudents > 0
              ? ((assignment.submittedCount / assignment.totalStudents) * 100).toFixed(0)
              : 0

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Left side - Assignment info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {assignment.description}
                    </p>
                    {assignment.assignmentDriveLink && (
                      <a
                        href={assignment.assignmentDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-4"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Assignment Drive Link
                      </a>
                    )}

                    {/* Details row */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
                          {new Date(assignment.dueDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isOverdue(assignment.dueDate) && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                            Overdue
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {assignment.passingYear} • {assignment.department} • Section {assignment.section}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-6">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {assignment.submittedCount}
                        </span>
                        <span className="text-gray-600">/{assignment.totalStudents}</span>
                        <p className="text-xs text-gray-500">Submitted</p>
                      </div>

                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          {submissionRate}%
                        </span>
                        <p className="text-xs text-gray-500">Completion Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/assignment/${assignment._id}/submissions`)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Submissions
                    </button>

                    <button
                      onClick={() => handleDelete(assignment._id)}
                      className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Submission Progress</span>
                    <span>{submissionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${submissionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TeacherAssignments
