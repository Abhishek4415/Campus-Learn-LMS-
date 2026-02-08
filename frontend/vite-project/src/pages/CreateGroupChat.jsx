// Frontend/src/pages/CreateGroupChat.jsx
import { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

function CreateGroupChat() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    passingYear: 2024,
    department: '',
    section: '',
    school: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await API.post('/api/groups/create', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const message = res.data.memberCount > 0 
        ? `Group created with ${res.data.memberCount} students!`
        : 'Group created! No students match the criteria yet.'
      alert(message)
      // Navigate after successful creation
      navigate('/teacher-groups')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create group')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create Group Chat</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Group Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        
        <select
          value={form.passingYear}
          onChange={e => setForm({...form, passingYear: parseInt(e.target.value)})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Passing Year</option>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
          <option value={2028}>2028</option>
          <option value={2029}>2029</option>
          <option value={2030}>2030</option>
        </select>

        <select
          value={form.school}
          onChange={e => setForm({...form, school: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select School</option>
          <option value="SOET">SOET</option>
        </select>

        <select
          value={form.department}
          onChange={e => setForm({...form, department: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Department</option>
          <option value="Computer Science">Computer Science</option>
        </select>

        <select
          value={form.section}
          onChange={e => setForm({...form, section: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Section</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
          <option value="G">G</option>
        </select>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  )
}

export default CreateGroupChat