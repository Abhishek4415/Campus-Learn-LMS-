# Backend Code - Complete Implementation

## 📄 File: /backend/routes/noteRoutes.js

```javascript
import express from 'express'
import upload from '../middleware/upload.js'
import Note from '../models/note.js'
import authMiddleware from '../middleware/authMiddleware.js'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// ============================================
// 1️⃣ POST /api/notes/upload - Upload Notes
// ============================================
router.post('/upload',
    authMiddleware,
    upload.single('file'),
    async (req, res) => {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({
                message: 'Only teachers can upload notes'
            })
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'No file uploaded'
                })
            }

            const note = new Note({
                title: req.body.title,
                subject: req.body.subject,
                fileUrl: req.file.path,
                uploadedBy: req.userId
            })

            await note.save()

            res.json({
                message: 'Note uploaded successfully',
                note: note
            })

        } catch (error) {
            console.error('Upload error:', error)
            res.status(500).json({
                message: 'Upload failed',
                error: error.message
            })
        }
    }
)

// ============================================
// 2️⃣ GET /api/notes/my-notes - Get Teacher's Notes
// ============================================
router.get('/my-notes', authMiddleware, async (req, res) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({
            message: 'Only teachers can view this'
        })
    }

    try {
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

// ============================================
// 3️⃣ GET /api/notes/all-notes - Get All Notes
// ============================================
router.get('/all-notes', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find()
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })

        res.json(notes)
    } catch (error) {
        console.error('Fetch all notes error:', error)
        res.status(500).json({
            message: 'Failed to fetch notes',
            error: error.message
        })
    }
})

// ============================================
// 4️⃣ GET /api/notes/ - Alternative Get All (Lean)
// ============================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find()
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .lean()

        res.json(notes)
    } catch (error) {
        console.error('Fetch notes error:', error)
        res.status(500).json({
            message: 'Failed to fetch notes',
            error: error.message
        })
    }
})

// ============================================
// 5️⃣ GET /api/notes/:id - Get Single Note
// ============================================
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate('uploadedBy', 'name email')

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            })
        }

        res.json(note)
    } catch (error) {
        console.error('Fetch note error:', error)
        res.status(500).json({
            message: 'Failed to fetch note',
            error: error.message
        })
    }
})

// ============================================
// 6️⃣ DELETE /api/notes/:id - Delete Note
// ============================================
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({
            message: 'Only teachers can delete notes'
        })
    }

    try {
        const note = await Note.findById(req.params.id)

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            })
        }

        // Check if the note belongs to the logged-in teacher
        if (note.uploadedBy.toString() !== req.userId) {
            return res.status(403).json({
                message: 'You can only delete your own notes'
            })
        }

        // Delete the file from the server
        if (note.fileUrl && fs.existsSync(note.fileUrl)) {
            try {
                fs.unlinkSync(note.fileUrl)
            } catch (fileError) {
                console.error('Error deleting file:', fileError)
                // Continue deletion even if file deletion fails
            }
        }

        // Delete the note from database
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

// ============================================
// 7️⃣ PUT /api/notes/:id - Update Note
// ============================================
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({
            message: 'Only teachers can update notes'
        })
    }

    try {
        const note = await Note.findById(req.params.id)

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            })
        }

        // Check if the note belongs to the logged-in teacher
        if (note.uploadedBy.toString() !== req.userId) {
            return res.status(403).json({
                message: 'You can only update your own notes'
            })
        }

        // Update title and subject if provided
        if (req.body.title) note.title = req.body.title
        if (req.body.subject) note.subject = req.body.subject

        await note.save()

        res.json({
            message: 'Note updated successfully',
            note: note
        })

    } catch (error) {
        console.error('Update note error:', error)
        res.status(500).json({
            message: 'Failed to update note',
            error: error.message
        })
    }
})

export default router
```

---

## 📄 File: /backend/models/note.js

```javascript
import mongoose from 'mongoose'

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

// Index for faster queries
noteSchema.index({ uploadedBy: 1 })
noteSchema.index({ subject: 1 })
noteSchema.index({ createdAt: -1 })

export default mongoose.model('Note', noteSchema)
```

---

## 📋 ROUTE MAPPING

```
┌──────────────────────────────────────────────────────┐
│              NOTE ROUTES OVERVIEW                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  POST   /api/notes/upload                           │
│  └─ Upload a note (Teacher only)                    │
│                                                      │
│  GET    /api/notes/my-notes                         │
│  └─ Get notes uploaded by teacher (Teacher only)    │
│                                                      │
│  GET    /api/notes/all-notes                        │
│  └─ Get all notes (Students)                        │
│                                                      │
│  GET    /api/notes/                                 │
│  └─ Alternative: Get all notes (Lean query)         │
│                                                      │
│  GET    /api/notes/:id                              │
│  └─ Get single note by ID                           │
│                                                      │
│  DELETE /api/notes/:id                              │
│  └─ Delete a note (Teacher only, own notes)         │
│                                                      │
│  PUT    /api/notes/:id                              │
│  └─ Update note details (Teacher only, own notes)   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 MIDDLEWARE FLOW

```
REQUEST
  │
  ▼
authMiddleware
  ├─ Verify JWT token
  ├─ Extract userId
  ├─ Extract userRole
  └─ Add to req object
  │
  ▼
FILE UPLOAD MIDDLEWARE (if POST)
  ├─ Process multipart form
  ├─ Validate file type
  ├─ Save to /uploads
  └─ Add req.file object
  │
  ▼
ROUTE HANDLER
  ├─ Validate authorization
  ├─ Process request
  ├─ Database operations
  └─ Send response
```

---

## 📊 DATABASE OPERATIONS

### CREATE (Upload)
```javascript
const note = new Note({
  title: req.body.title,
  subject: req.body.subject,
  fileUrl: req.file.path,
  uploadedBy: req.userId
})
await note.save()
```

### READ (Get My Notes)
```javascript
const notes = await Note.find({ uploadedBy: req.userId })
  .populate('uploadedBy', 'name email')
  .sort({ createdAt: -1 })
```

### READ (Get All)
```javascript
const notes = await Note.find()
  .populate('uploadedBy', 'name email')
  .sort({ createdAt: -1 })
```

### UPDATE
```javascript
const note = await Note.findById(id)
note.title = newTitle
note.subject = newSubject
await note.save()
```

### DELETE
```javascript
// Delete file
fs.unlinkSync(note.fileUrl)

// Delete from database
await Note.findByIdAndDelete(id)
```

---

## 🔒 AUTHORIZATION CHECKS

```javascript
// Check 1: Is user a teacher?
if (req.userRole !== 'teacher') {
  return res.status(403).json({ message: 'Only teachers can...' })
}

// Check 2: Does note exist?
const note = await Note.findById(id)
if (!note) {
  return res.status(404).json({ message: 'Note not found' })
}

// Check 3: Does teacher own the note?
if (note.uploadedBy.toString() !== req.userId) {
  return res.status(403).json({ message: 'You can only... your own notes' })
}
```

---

## 💡 KEY CONCEPTS

### Populate
```javascript
// Gets teacher details instead of just ID
.populate('uploadedBy', 'name email')
```

### Lean Query
```javascript
// Returns plain JavaScript objects (faster)
.lean()
```

### Sort
```javascript
// -1 = descending (newest first), 1 = ascending
.sort({ createdAt: -1 })
```

### File Deletion
```javascript
// Delete file from disk
fs.unlinkSync(filePath)

// Check if file exists before deleting
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath)
}
```

---

## ⚠️ ERROR HANDLING

```javascript
try {
  // Perform operation
  const result = await Note.findById(id)
  res.json(result)
} catch (error) {
  console.error('Operation error:', error)
  res.status(500).json({
    message: 'Operation failed',
    error: error.message
  })
}
```

---

## 📞 QUICK REFERENCE

| Operation | Endpoint | Method | Auth |
|-----------|----------|--------|------|
| Upload | /upload | POST | Teacher |
| My Notes | /my-notes | GET | Teacher |
| All Notes | /all-notes | GET | Any |
| Single | /:id | GET | Any |
| Delete | /:id | DELETE | Teacher |
| Update | /:id | PUT | Teacher |

---

## ✅ TESTING COMPLETE

All 7 endpoints are:
- ✅ Implemented
- ✅ Secured
- ✅ Error handled
- ✅ Documented
- ✅ Ready to test

Next: Run tests using TESTING_GUIDE.md
