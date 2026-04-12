import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { ClipboardList, Calendar, Link2, Users, Sparkles } from 'lucide-react'

function CreateAssignment() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignmentDriveLink: '',
    passingYear: 2026,
    department: '',
    section: '',
    dueDate: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const departments = ['Computer Science', 'SOET', 'Civil', 'Electrical']
  const sections = ['A', 'B', 'C', 'D']
  const years = [2026, 2027, 2028, 2029, 2030]

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await API.post('/api/assignments/create', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      setSuccess(`Assignment created successfully and assigned to ${res.data.studentsCount} students.`)
      setTimeout(() => navigate('/my-assignments'), 900)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="page-container">
        <div className="page-section max-w-3xl mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Create Assignment</h1>
                <p className="text-blue-100 text-sm sm:text-base mt-1">
                  Set instructions, attach Drive resource, and assign to a class segment.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Data Structures Assignment 1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Write assignment instructions, expected output, and submission notes."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Drive Link *</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={form.assignmentDriveLink}
                    onChange={(e) => updateField('assignmentDriveLink', e.target.value)}
                    className="w-full h-11 pl-10 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Add the Google Drive link that contains question sheet/resources.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Year *</label>
                  <select
                    value={form.passingYear}
                    onChange={(e) => updateField('passingYear', Number(e.target.value))}
                    className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
                  <select
                    required
                    value={form.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Section *</label>
                  <select
                    required
                    value={form.section}
                    onChange={(e) => updateField('section', e.target.value)}
                    className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select section</option>
                    {sections.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date & Time *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="datetime-local"
                    required
                    value={form.dueDate}
                    onChange={(e) => updateField('dueDate', e.target.value)}
                    className="w-full h-11 pl-10 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Users className="w-4 h-4" />
                    Target Students
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Assignment will be assigned by selected year, department, and section.
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
                    <Sparkles className="w-4 h-4" />
                    Submission Tip
                  </p>
                  <p className="text-xs text-cyan-700 mt-1">
                    Ask students to include code and report links clearly in their submission.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:opacity-95 disabled:opacity-60"
              >
                {loading ? 'Creating Assignment...' : 'Create Assignment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAssignment
