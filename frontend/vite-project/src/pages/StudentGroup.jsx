// Frontend/src/pages/StudentGroups.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function StudentGroups() {
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
      const res = await API.get('/api/groups/student-groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      console.log('Groups loaded:', res.data) // Debug log
      setGroups(res.data)
    } catch (err) {
      console.error('Error loading groups:', err)
      setError(err.response?.data?.message || 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">My Groups</h2>
        <p className="text-gray-600">Loading groups...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">My Groups</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Groups</h2>
      
      {groups.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600">No groups found. Wait for your teacher to create groups for your class.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map(group => (
            <div
              key={group._id}
              onClick={() => navigate(`/chat/${group._id}`)}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="font-bold text-lg">{group.name}</h3>
              <p className="text-sm text-gray-600">
                {group.passingYear} • {group.school} • {group.department} • Section {group.section}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Created by {group.createdBy?.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {group.members?.length || 0} members
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentGroups