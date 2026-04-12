// Frontend/src/pages/AssignmentSubmissions.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import API from '../services/api'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

function AssignmentSubmissions() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('submitted')
  const [marksBySubmission, setMarksBySubmission] = useState({})
  const [savingMarks, setSavingMarks] = useState({})

  useEffect(() => {
    loadSubmissions()
  }, [id])

  const loadSubmissions = async () => {
    try {
      const res = await API.get(`/api/assignments/${id}/submissions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setData(res.data)
      const initialMarks = {}
      res.data.submitted.forEach((item) => {
        initialMarks[item.submission._id] = item.submission.grade || ''
      })
      setMarksBySubmission(initialMarks)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMarks = async (submissionId) => {
    const marks = (marksBySubmission[submissionId] || '').trim()
    if (!marks) {
      alert('Please enter marks')
      return
    }

    try {
      setSavingMarks((prev) => ({ ...prev, [submissionId]: true }))
      await API.post(
        `/api/assignments/submission/${submissionId}/feedback`,
        { grade: marks },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      await loadSubmissions()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save marks')
    } finally {
      setSavingMarks((prev) => ({ ...prev, [submissionId]: false }))
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{data.assignment.title}</h1>
        <p className="text-gray-600 mb-4">{data.assignment.description}</p>
        {data.assignment.assignmentDriveLink && (
          <a
            href={data.assignment.assignmentDriveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mb-4"
          >
            <ExternalLink className="w-4 h-4" />
            Open assignment materials
          </a>
        )}
        
        <div className="flex gap-4 text-sm">
          <span>Due: {new Date(data.assignment.dueDate).toLocaleString()}</span>
          <span>•</span>
          <span>{data.assignment.passingYear} - {data.assignment.department} - {data.assignment.section}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Students</p>
          <p className="text-3xl font-bold">{data.stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-green-600 text-sm">Submitted</p>
          <p className="text-3xl font-bold text-green-600">{data.stats.submitted}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-red-600 text-sm">Not Submitted</p>
          <p className="text-3xl font-bold text-red-600">{data.stats.notSubmitted}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'submitted'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Submitted ({data.stats.submitted})
          </button>
          <button
            onClick={() => setActiveTab('notSubmitted')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'notSubmitted'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Not Submitted ({data.stats.notSubmitted})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'submitted' ? (
            <div className="space-y-4">
              {data.submitted.map((item) => (
                <div key={item.student._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold">{item.student.name}</p>
                        <p className="text-sm text-gray-600">{item.student.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(item.submission.submittedAt).toLocaleString()}
                        </p>
                        {item.isLate && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                            Late Submission
                          </span>
                        )}
                        {item.submission.grade ? (
                          <p className="text-xs text-blue-700 mt-1 font-medium">
                            Marks: {item.submission.grade}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-700 mt-1 font-medium">
                            Marks: Pending
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={item.submission.submissionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  </div>
                  {item.submission.message && (
                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {item.submission.message}
                    </p>
                  )}
                  {!item.submission.grade ? (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Enter marks (e.g. 8/10 or 85)"
                        value={marksBySubmission[item.submission._id] || ''}
                        onChange={(e) =>
                          setMarksBySubmission((prev) => ({
                            ...prev,
                            [item.submission._id]: e.target.value
                          }))
                        }
                        className="w-full sm:w-64 p-2 border rounded text-sm"
                      />
                      <button
                        onClick={() => handleSaveMarks(item.submission._id)}
                        disabled={savingMarks[item.submission._id]}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
                      >
                        {savingMarks[item.submission._id] ? 'Saving...' : 'Save Marks'}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-emerald-700 font-medium">
                      Marks submitted
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {data.notSubmitted.map((item) => (
                <div key={item.student._id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium">{item.student.name}</p>
                    <p className="text-sm text-gray-600">{item.student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignmentSubmissions;
