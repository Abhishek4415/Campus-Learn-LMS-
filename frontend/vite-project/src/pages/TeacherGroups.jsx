// Frontend/src/pages/TeacherGroups.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function TeacherGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await API.get('/api/groups/my-groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      console.log('Teacher groups loaded:', res.data)
      setGroups(res.data)
    } catch (err) {
      console.error('Error loading groups:', err)
      setError(err.response?.data?.message || 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async (groupId, e) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    if (!window.confirm('Are you sure you want to delete this group?')) return

    try {
      await API.delete(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('Group deleted successfully')
      loadGroups() // Reload groups
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Groups</h2>
        </div>
        <p className="text-gray-600">Loading groups...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Groups</h2>
          <button
            onClick={() => navigate('/create-group')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create New Group
          </button>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Groups</h2>
        <button
          onClick={() => navigate('/create-group')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Group
        </button>
      </div>
      
      {groups.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">You haven't created any groups yet.</p>
          <button
            onClick={() => navigate('/create-group')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map(group => (
            <div
              key={group._id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/chat/${group._id}`)}
                >
                  <h3 className="font-bold text-lg">{group.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {group.passingYear} • {group.school} • {group.department} • Section {group.section}
                  </p>
                  {group.description && (
                    <p className="text-sm text-gray-500 mt-2">{group.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <strong>{group.members?.length || 0}</strong> students joined
                    </span>
                    <span>
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteGroup(group._id, e)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeacherGroups