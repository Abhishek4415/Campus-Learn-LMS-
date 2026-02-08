// ============================================
// COMPLETE IMPLEMENTATION GUIDE
// ============================================

// ======== DELETE NOTES FEATURE ========

// BACKEND (Backend/routes/noteRoutes.js)
router.delete('/:id', authMiddleware, async (req, res) => {
  // Check if user is teacher
  if (req.userRole !== 'teacher') {
    return res.status(403).json({
      message: 'Only teachers can delete notes'
    })
  }

  try {
    // Find the note
    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({
        message: 'Note not found'
      })
    }

    // Check if note belongs to current teacher
    if (note.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({
        message: 'You can only delete your own notes'
      })
    }

    // Delete file from server
    if (note.fileUrl && fs.existsSync(note.fileUrl)) {
      try {
        fs.unlinkSync(note.fileUrl)
      } catch (fileError) {
        console.error('Error deleting file:', fileError)
      }
    }

    // Delete note from database
    await Note.findByIdAndDelete(req.params.id)

    res.json({
      message: 'Note deleted successfully'
    })

  } catch (error) {
    console.error('Delete note error:', error)
    res.status(500).json({
      message: 'Failed to delete note',
      error: error.message
    })
  }
})

// FRONTEND (Frontend/src/pages/ManageNotes.jsx)
const handleDelete = async (noteId) => {
  if (window.confirm('Are you sure you want to delete this note?')) {
    try {
      await API.delete(`/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      // Update local state
      setNotes(notes.filter(note => note._id !== noteId))
    } catch (error) {
      console.log(error)
      alert('Failed to delete note')
    }
  }
}

/* ======== DELETE FLOW ========
1. Teacher clicks delete button (trash icon)
2. Confirmation dialog appears
3. Backend validates:
   - User is logged in (authMiddleware)
   - User is a teacher
   - Note exists in database
   - Note belongs to current teacher
4. Backend deletes:
   - PDF file from /uploads folder
   - Note document from MongoDB
5. Frontend updates notes list
6. Success message shows to teacher
========================================== */


// ======== VIEW ALL NOTES FEATURE ========

// BACKEND (Backend/routes/noteRoutes.js)
router.get('/all-notes', authMiddleware, async (req, res) => {
  try {
    // Fetch all notes with teacher details
    const notes = await Note.find()
      .populate('uploadedBy', 'name email')  // Get teacher name & email
      .sort({ createdAt: -1 })                // Sort by newest first

    res.json(notes)
  } catch (error) {
    console.error('Fetch all notes error:', error)
    res.status(500).json({
      message: 'Failed to fetch notes',
      error: error.message
    })
  }
})

// Alternative endpoint without populate (better performance)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()  // Returns plain objects (faster)

    res.json(notes)
  } catch (error) {
    console.error('Fetch notes error:', error)
    res.status(500).json({
      message: 'Failed to fetch notes',
      error: error.message
    })
  }
})

// FRONTEND (Frontend/src/pages/StudentNotes.jsx)
useEffect(() => {
  const fetchAllNotes = async () => {
    try {
      // Try primary endpoint
      const res = await API.get('/api/notes/all-notes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setNotes(res.data)
      setFilteredNotes(res.data)
      
      // Load favorites from localStorage
      const savedFavorites = JSON.parse(localStorage.getItem('favoritesNotes') || '[]')
      setFavorites(savedFavorites)
    } catch (error) {
      console.log(error)
      // Fallback to alternative endpoint
      try {
        const res = await API.get('/api/notes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setNotes(res.data)
        setFilteredNotes(res.data)
      } catch (err) {
        console.log('Could not fetch notes:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  fetchAllNotes()
}, [])

/* ======== VIEW ALL NOTES FLOW ========
1. Student navigates to "View Notes" page
2. Frontend calls GET /api/notes/all-notes
3. Backend validates authentication
4. Backend queries database:
   - Find all notes
   - Get teacher details (populate)
   - Sort by newest first
5. Backend returns array of notes
6. Frontend displays in grid/list:
   - Note title, subject, teacher name
   - Upload date
   - View/Download buttons
   - Star to save favorites
7. Student can:
   - Search by title/subject
   - Filter by subject
   - Sort (recent, oldest, alphabetical)
   - Mark as favorite (saved locally)
   - View PDF
   - Download PDF
========================================== */


// ======== SHOW MY NOTES (TEACHER) ========

// BACKEND (Backend/routes/noteRoutes.js)
router.get('/my-notes', authMiddleware, async (req, res) => {
  // Only teachers can access
  if (req.userRole !== 'teacher') {
    return res.status(403).json({
      message: 'Only teachers can view this'
    })
  }

  try {
    // Get notes uploaded by current teacher
    const notes = await Note.find({ uploadedBy: req.userId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(notes)
  } catch (error) {
    console.error('Fetch notes error:', error)
    res.status(500).json({
      message: 'Failed to fetch notes',
      error: error.message
    })
  }
})

// FRONTEND (Frontend/src/pages/ManageNotes.jsx)
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

/* ======== SHOW MY NOTES FLOW ========
1. Teacher navigates to "Manage Notes" page
2. Frontend calls GET /api/notes/my-notes
3. Backend validates:
   - User is logged in
   - User is a teacher
4. Backend queries database:
   - Find notes WHERE uploadedBy == teacher's ID
   - Get teacher details (populate)
   - Sort by newest first
5. Backend returns array of teacher's notes only
6. Frontend displays in grid/card view:
   - Note title, subject, upload date
   - Download count (views)
   - Edit button (future feature)
   - Delete button (with confirmation)
7. Teacher can:
   - Search notes
   - Filter by subject
   - Sort notes
   - Delete their own notes
   - View note details
========================================== */


// ======== DATABASE MODEL ========
// Backend/models/note.js

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

// Create indexes for faster queries
noteSchema.index({ uploadedBy: 1 })      // Fast teacher queries
noteSchema.index({ subject: 1 })         // Fast subject filtering
noteSchema.index({ createdAt: -1 })      // Fast date sorting

/* ======== COMPLETE API ENDPOINTS ========

POST   /api/notes/upload       - Teacher uploads notes
GET    /api/notes/my-notes     - Teacher views their notes
GET    /api/notes/all-notes    - Students view all notes
GET    /api/notes/:id          - View single note
DELETE /api/notes/:id          - Delete note
PUT    /api/notes/:id          - Update note details

=========================================== */


// ======== USAGE EXAMPLES ========

// Upload a note
POST /api/notes/upload
Authorization: Bearer token123
Content-Type: multipart/form-data

title=Calculus Introduction
subject=Mathematics
file=<PDF file>

Response:
{
  "message": "Note uploaded successfully",
  "note": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Calculus Introduction",
    "subject": "Mathematics",
    "uploadedBy": "507f1f77bcf86cd799439012",
    "createdAt": "2024-12-24T10:30:00Z"
  }
}

// Get all notes (students)
GET /api/notes/all-notes
Authorization: Bearer token123

Response:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Calculus Introduction",
    "subject": "Mathematics",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Mr. John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-12-24T10:30:00Z"
  }
]

// Delete note (teacher)
DELETE /api/notes/507f1f77bcf86cd799439011
Authorization: Bearer token123

Response:
{
  "message": "Note deleted successfully"
}

// Update note (teacher)
PUT /api/notes/507f1f77bcf86cd799439011
Authorization: Bearer token123
Content-Type: application/json

{
  "title": "Advanced Calculus",
  "subject": "Mathematics"
}

Response:
{
  "message": "Note updated successfully",
  "note": { ... updated note ... }
}

========================================== */
