// Frontend/src/pages/GroupChat.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { Send, ArrowLeft, MoreVertical, Paperclip, X, Check, Trash2, Download } from 'lucide-react'
import API from '../services/api'

let socket = null

function GroupChat() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [typing, setTyping] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [groupInfo, setGroupInfo] = useState(null)
  const [selectedMessages, setSelectedMessages] = useState([])
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [showMessageMenu, setShowMessageMenu] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const messagesEnd = useRef(null)
  const fileInputRef = useRef(null)
  const groupMenuRef = useRef(null)
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling']
      })
    }
  }, [])

  useEffect(() => {
    if (!groupId) {
      setError('No group ID provided')
      setLoading(false)
      return
    }

    loadMessages()
    loadGroupInfo()

    socket.emit('join-group', groupId)

    const handleNewMessage = (msg) => {
      setMessages(prev => {
        const exists = prev.some(m => m._id === msg._id)
        if (exists) return prev
        return [...prev, msg]
      })
    }

    const handleMessageDeleted = (data) => {
      setMessages(prev => prev.filter(m => m._id !== data.messageId))
    }

    const handleChatCleared = () => {
      setMessages([])
    }

    const handleTyping = (name) => {
      setTyping(`${name} is typing...`)
      setTimeout(() => setTyping(''), 3000)
    }

    socket.on('new-message', handleNewMessage)
    socket.on('message-deleted', handleMessageDeleted)
    socket.on('chat-cleared', handleChatCleared)
    socket.on('user-typing', handleTyping)

    return () => {
      socket.emit('leave-group', groupId)
      socket.off('new-message', handleNewMessage)
      socket.off('message-deleted', handleMessageDeleted)
      socket.off('chat-cleared', handleChatCleared)
      socket.off('user-typing', handleTyping)
    }
  }, [groupId])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target)) {
        setShowGroupMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadGroupInfo = async () => {
    try {
      const res = await API.get(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setGroupInfo(res.data)
    } catch (err) {
      console.error('Error loading group info:', err)
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await API.get(`/api/messages/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      const uniqueMessages = res.data.filter((msg, index, self) =>
        index === self.findIndex(m => m._id === msg._id)
      )

      setMessages(uniqueMessages)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages')
      setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return

    try {
      const formData = new FormData()
      formData.append('groupId', groupId)
      if (newMessage.trim()) {
        formData.append('content', newMessage)
      }
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      await API.post('/api/messages/send', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setNewMessage('')
      setSelectedFile(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const deleteMessage = async (messageId, deleteForEveryone = false) => {
    try {
      await API.delete(`/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { deleteForEveryone }
      })

      if (!deleteForEveryone) {
        // Only remove locally for "delete for me"
        setMessages(prev => prev.filter(m => m._id !== messageId))
      }

      setShowMessageMenu(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message')
    }
  }

  const clearChat = async () => {
    if (!window.confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      return
    }

    try {
      await API.delete(`/api/messages/clear/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setShowGroupMenu(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear chat')
    }
  }

  const downloadFile = (fileUrl, fileName) => {
    const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl

    const ext = cleanPath.split('.').pop()

    const link = document.createElement('a')
    link.href = `http://localhost:5000/${cleanPath}`
    link.setAttribute('download', `${fileName}.${ext}`)
    link.setAttribute('target', '_blank')

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }



  const handleTyping = () => {
    if (socket && socket.connected) {
      socket.emit('typing', { groupId, userName: user?.name || 'Someone' })
    }
  }

  const formatTime = (date) => {
    const messageDate = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleColor = (role) => {
    return role === 'teacher' ? 'bg-purple-500' : 'bg-blue-500'
  }

  const getRoleBadge = (role) => {
    return role === 'teacher'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const isOwnMessage = (msg) => msg.sender._id === user?.id

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#0a1014]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884] mb-4"></div>
        <p className="text-gray-400">Loading messages...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#0a1014] p-4">
        <div className="bg-[#1f2c34] border border-red-500/20 text-red-400 px-6 py-4 rounded-lg mb-4 max-w-md text-center">
          <h3 className="font-bold mb-2">Error Loading Chat</h3>
          <p>{error}</p>
        </div>
        <div className="space-x-4">
          <button
            onClick={loadMessages}
            className="bg-[#00a884] text-white px-4 py-2 rounded hover:bg-[#00a884]/90"
          >
            Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#1f2c34] text-white px-4 py-2 rounded hover:bg-[#2a3942]"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a1014]">
      {/* Fixed Header */}
      <div className="bg-[#1f2c34] border-b border-[#2a3942] px-4 py-3 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>

            <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {groupInfo?.name?.charAt(0)?.toUpperCase() || 'G'}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-white font-medium truncate">{groupInfo?.name || 'Group Chat'}</h2>
              <p className="text-xs text-gray-400 truncate">
                {groupInfo?.passingYear} • {groupInfo?.department} • Section {groupInfo?.section}
              </p>
            </div>
          </div>

          {/* Group Menu */}
          <div className="relative ml-2" ref={groupMenuRef}>
            <button
              onClick={() => setShowGroupMenu(!showGroupMenu)}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showGroupMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#2a3942] rounded-lg shadow-xl border border-[#3a4952] z-50">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowGroupMenu(false)
                      navigate(`/group-info/${groupId}`)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1f2c34] transition-colors"
                  >
                    Group Info
                  </button>

                  {user?.role === 'teacher' && (
                    <>
                      <button
                        onClick={clearChat}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1f2c34] transition-colors"
                      >
                        Clear Chat (Teacher Only)
                      </button>
                      <button
                        onClick={() => {
                          setShowGroupMenu(false)
                          // Navigate to group settings
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1f2c34] transition-colors"
                      >
                        Group Settings
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setShowGroupMenu(false)
                      navigate(-1)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1f2c34] transition-colors"
                  >
                    Exit Group
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h100v100H0z" fill="%23111b21"/%3E%3Cpath d="M20 20h5v5h-5zM40 20h5v5h-5zM60 20h5v5h-5zM80 20h5v5h-5zM20 40h5v5h-5zM40 40h5v5h-5zM60 40h5v5h-5zM80 40h5v5h-5zM20 60h5v5h-5zM40 60h5v5h-5zM60 60h5v5h-5zM80 60h5v5h-5zM20 80h5v5h-5zM40 80h5v5h-5zM60 80h5v5h-5zM80 80h5v5h-5z" fill="%23182229" opacity="0.06"/%3E%3C/svg%3E")',
          backgroundSize: '100px 100px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="w-20 h-20 bg-[#1f2c34] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-10 w-10 text-gray-600" />
                </div>
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = isOwnMessage(msg)
              const showAvatar = !isOwn && (
                index === messages.length - 1 ||
                messages[index + 1]?.sender._id !== msg.sender._id
              )

              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group`}
                >
                  {!isOwn && (
                    <div className="mr-2 mt-auto mb-1">
                      {showAvatar ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getRoleColor(msg.sender.role)}`}>
                          {getInitials(msg.sender.name)}
                        </div>
                      ) : (
                        <div className="w-8"></div>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <div
                      className={`max-w-md px-3 py-2 rounded-lg shadow-md ${isOwn
                        ? 'bg-[#005c4b] text-white rounded-br-none'
                        : 'bg-[#1f2c34] text-white rounded-bl-none'
                        }`}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setShowMessageMenu(msg._id)
                      }}
                    >
                      {!isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-[#00a884]">
                            {msg.sender.name}
                          </p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getRoleBadge(msg.sender.role)}`}>
                            {msg.sender.role}
                          </span>
                        </div>
                      )}

                      {msg.fileUrl && (
                        <div className="mb-2 p-2 bg-black/20 rounded flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Paperclip className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm truncate">{msg.fileName || 'File'}</span>
                          </div>
                          <button
                            onClick={() => downloadFile(msg.fileUrl, msg.fileName)}
                            className="ml-2 p-1 hover:bg-white/10 rounded flex-shrink-0"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      <p className="text-[15px] break-words leading-relaxed">
                        {msg.content}
                      </p>

                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[11px] ${isOwn ? 'text-gray-300' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          <Check className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </div>

                    {/* Message Context Menu */}
                    {showMessageMenu === msg._id && (
                      <div className="absolute top-0 right-0 mt-2 w-48 bg-[#2a3942] rounded-lg shadow-xl border border-[#3a4952] z-50">
                        <div className="py-2">
                          {isOwn && (
                            <button
                              onClick={() => deleteMessage(msg._id, true)}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1f2c34] transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete for Everyone
                            </button>
                          )}
                          <button
                            onClick={() => deleteMessage(msg._id, false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1f2c34] transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete for Me
                          </button>
                          <button
                            onClick={() => setShowMessageMenu(null)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1f2c34] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isOwn && <div className="w-8"></div>}
                </div>
              )
            })
          )}
          <div ref={messagesEnd} />
        </div>
      </div>

      {/* Typing Indicator */}
      {typing && (
        <div className="px-6 py-2 bg-[#0a1014] flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-sm text-[#00a884]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#00a884] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span>{typing}</span>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Input Bar */}
      <div className="bg-[#1f2c34] border-t border-[#2a3942] px-4 py-3 flex-shrink-0">
        <form onSubmit={sendMessage} className="max-w-7xl mx-auto">
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 bg-[#2a3942] p-2 rounded">
              <Paperclip className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300 flex-1 truncate">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-white transition-colors p-2 flex-shrink-0"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
              placeholder="Type a message"
              className="flex-1 bg-[#2a3942] text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
            />

            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedFile}
              className="bg-[#00a884] hover:bg-[#00a884]/90 text-white p-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GroupChat