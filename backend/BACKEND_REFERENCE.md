// ============================================
// BACKEND ROUTES - QUICK REFERENCE
// ============================================

// FILE: /backend/routes/noteRoutes.js

/* ======== ENDPOINTS OVERVIEW ======== */

1. POST /api/notes/upload
   - Teacher uploads PDF notes
   - Auth: Required (Teacher only)
   - Body: title, subject, file (PDF)
   - Returns: Uploaded note object

2. GET /api/notes/my-notes
   - Get all notes uploaded by current teacher
   - Auth: Required (Teacher only)
   - Returns: Array of teacher's notes with teacher details populated

3. GET /api/notes/all-notes
   - Get all notes available in system (for students)
   - Auth: Required
   - Returns: Array of all notes

4. GET /api/notes/
   - Alternative endpoint to get all notes
   - Auth: Required
   - Returns: Array of all notes (lean query for performance)

5. GET /api/notes/:id
   - Get a specific note by ID
   - Auth: Required
   - Params: noteId
   - Returns: Single note object with teacher details

6. DELETE /api/notes/:id
   - Delete a note (teacher only - own notes)
   - Auth: Required (Teacher only)
   - Params: noteId
   - Returns: Success message
   - Actions: Deletes PDF file from server, removes from database

7. PUT /api/notes/:id
   - Update note title/subject (teacher only - own notes)
   - Auth: Required (Teacher only)
   - Params: noteId
   - Body: title (optional), subject (optional)
   - Returns: Updated note object

/* ======== SECURITY FEATURES ======== */

✓ Authentication: Token-based (JWT)
✓ Authorization: Role-based (student/teacher)
✓ File Validation: PDF only, max 10MB
✓ Ownership Check: Teachers can only delete/update their own notes
✓ Database Indexes: For fast queries
✓ Error Handling: Comprehensive error messages

/* ======== DATABASE OPERATIONS ======== */

Upload:
- Create new Note document
- Store file path
- Link to teacher (uploadedBy)
- Save to MongoDB

Retrieve (My Notes):
- Find notes by uploadedBy == req.userId
- Populate teacher details
- Sort by newest first

Retrieve (All Notes):
- Find all notes
- Populate teacher details
- Sort by newest first

Retrieve (Single):
- Find note by ID
- Populate teacher details

Delete:
- Find note by ID
- Verify ownership
- Delete file from /uploads folder
- Remove from database

Update:
- Find note by ID
- Verify ownership
- Update title/subject fields
- Save changes

/* ======== FILE STRUCTURE ======== */

Backend/
├── routes/
│   └── noteRoutes.js          ← Main note routes (READ THIS)
├── models/
│   └── note.js                ← Note schema definition
├── middleware/
│   ├── authMiddleware.js      ← Token verification
│   └── upload.js              ← File upload config
├── controllers/
│   └── noteController.js      ← (Optional) Business logic
└── uploads/                   ← Stores uploaded PDF files
    └── note_*.pdf

/* ======== ERROR CODES ======== */

200 - Success
400 - Bad Request (missing fields)
401 - Unauthorized (no token)
403 - Forbidden (not teacher/not owner)
404 - Not Found (note doesn't exist)
500 - Server Error

/* ======== TESTING ENDPOINTS ======== */

Using cURL:

// Upload note
curl -X POST http://localhost:5000/api/notes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Notes" \
  -F "subject=Math" \
  -F "file=@path/to/file.pdf"

// Get all notes
curl -X GET http://localhost:5000/api/notes/all-notes \
  -H "Authorization: Bearer YOUR_TOKEN"

// Get my notes (teacher)
curl -X GET http://localhost:5000/api/notes/my-notes \
  -H "Authorization: Bearer YOUR_TOKEN"

// Delete note
curl -X DELETE http://localhost:5000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

// Update note
curl -X PUT http://localhost:5000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","subject":"Math"}'

/* ======== KEY FUNCTIONS ======== */

// File Deletion
fs.unlinkSync(note.fileUrl) - Deletes PDF from server
// Database Deletion
await Note.findByIdAndDelete(id) - Removes from database
// Query Populate
await Note.find().populate('uploadedBy', 'name email')
// Lean Query
await Note.find().lean() - Returns plain objects (faster)

/* ======== IMPORTANT NOTES ======== */

1. Always verify user role (req.userRole)
2. Check ownership before delete/update
3. Handle file deletion errors gracefully
4. Use populate() for teacher details
5. Sort by createdAt: -1 for newest first
6. Use lean() for read-only queries (performance)
7. Add proper error logging
8. Validate file before saving
9. Clean up files when deleting notes
10. Return meaningful error messages
