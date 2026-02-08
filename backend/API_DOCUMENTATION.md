# CampusLearn Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require:
- **Header**: `Authorization: Bearer <token>`
- Token is received after login/register

---

## 📚 NOTES API ENDPOINTS

### 1. **POST /api/notes/upload** - Upload a Note
**Authentication**: Required (Teacher only)

**Request:**
```bash
POST /api/notes/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- title: string (required) - Note title
- subject: string (required) - Subject name
- file: PDF file (required) - PDF file (max 10MB)
```

**Response (Success):**
```json
{
  "message": "Note uploaded successfully",
  "note": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Calculus",
    "subject": "Mathematics",
    "fileUrl": "uploads/note_1.pdf",
    "uploadedBy": "507f1f77bcf86cd799439012",
    "createdAt": "2024-12-24T10:30:00Z",
    "updatedAt": "2024-12-24T10:30:00Z"
  }
}
```

**Error Responses:**
```json
// Not a teacher
{
  "message": "Only teachers can upload notes"
}

// No file uploaded
{
  "message": "No file uploaded"
}

// Server error
{
  "message": "Upload failed",
  "error": "error details"
}
```

---

### 2. **GET /api/notes/my-notes** - Get Teacher's Notes
**Authentication**: Required (Teacher only)

**Request:**
```bash
GET /api/notes/my-notes
Authorization: Bearer <token>
```

**Response (Success):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Calculus",
    "subject": "Mathematics",
    "fileUrl": "uploads/note_1.pdf",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Mr. John Doe",
      "email": "john@example.com"
    },
    "views": 45,
    "createdAt": "2024-12-24T10:30:00Z",
    "updatedAt": "2024-12-24T10:30:00Z"
  }
]
```

---

### 3. **GET /api/notes/all-notes** - Get All Notes (Students)
**Authentication**: Required

**Request:**
```bash
GET /api/notes/all-notes
Authorization: Bearer <token>
```

**Response (Success):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Calculus",
    "subject": "Mathematics",
    "fileUrl": "uploads/note_1.pdf",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Mr. John Doe",
      "email": "john@example.com"
    },
    "views": 45,
    "createdAt": "2024-12-24T10:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Organic Chemistry Basics",
    "subject": "Chemistry",
    "fileUrl": "uploads/note_2.pdf",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Mrs. Jane Smith",
      "email": "jane@example.com"
    },
    "views": 32,
    "createdAt": "2024-12-23T14:20:00Z"
  }
]
```

---

### 4. **GET /api/notes/:id** - Get Single Note by ID
**Authentication**: Required

**Request:**
```bash
GET /api/notes/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Introduction to Calculus",
  "subject": "Mathematics",
  "fileUrl": "uploads/note_1.pdf",
  "uploadedBy": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Mr. John Doe",
    "email": "john@example.com"
  },
  "views": 45,
  "createdAt": "2024-12-24T10:30:00Z"
}
```

**Error Response:**
```json
{
  "message": "Note not found"
}
```

---

### 5. **DELETE /api/notes/:id** - Delete a Note
**Authentication**: Required (Teacher only - own notes only)

**Request:**
```bash
DELETE /api/notes/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "message": "Note deleted successfully"
}
```

**Error Responses:**
```json
// Not a teacher
{
  "message": "Only teachers can delete notes"
}

// Note not found
{
  "message": "Note not found"
}

// Trying to delete someone else's note
{
  "message": "You can only delete your own notes"
}

// Server error
{
  "message": "Failed to delete note",
  "error": "error details"
}
```

**What happens:**
1. Validates user is a teacher
2. Finds the note by ID
3. Checks if note belongs to current teacher
4. Deletes the PDF file from server
5. Removes note record from database

---

### 6. **PUT /api/notes/:id** - Update Note Details
**Authentication**: Required (Teacher only - own notes only)

**Request:**
```bash
PUT /api/notes/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Content-Type: application/json

Body (optional):
{
  "title": "Advanced Calculus",
  "subject": "Mathematics"
}
```

**Response (Success):**
```json
{
  "message": "Note updated successfully",
  "note": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced Calculus",
    "subject": "Mathematics",
    "fileUrl": "uploads/note_1.pdf",
    "uploadedBy": "507f1f77bcf86cd799439012",
    "updatedAt": "2024-12-24T11:45:00Z"
  }
}
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### POST /api/auth/register - Register New User
```bash
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // or "teacher"
}

Response:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/login - Login User
```bash
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## 📋 EXAMPLE USAGE IN FRONTEND

### Upload Note (Teacher)
```javascript
const handleUpload = async (e) => {
  e.preventDefault()
  const formData = new FormData()
  formData.append('title', title)
  formData.append('subject', subject)
  formData.append('file', file)

  try {
    const response = await API.post('/api/notes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    console.log('Upload successful:', response.data)
  } catch (error) {
    console.error('Upload failed:', error.response.data)
  }
}
```

### Get All Notes (Student)
```javascript
const fetchAllNotes = async () => {
  try {
    const response = await API.get('/api/notes/all-notes', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    setNotes(response.data)
  } catch (error) {
    console.error('Failed to fetch notes:', error)
  }
}
```

### Get My Notes (Teacher)
```javascript
const fetchMyNotes = async () => {
  try {
    const response = await API.get('/api/notes/my-notes', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    setNotes(response.data)
  } catch (error) {
    console.error('Failed to fetch notes:', error)
  }
}
```

### Delete Note (Teacher)
```javascript
const handleDelete = async (noteId) => {
  if (window.confirm('Are you sure?')) {
    try {
      const response = await API.delete(`/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      console.log(response.data.message)
      // Refresh notes list
    } catch (error) {
      console.error('Delete failed:', error.response.data)
    }
  }
}
```

---

## 🔍 Database Schema

### Note Model
```javascript
{
  _id: ObjectId,
  title: String (required, max 200 chars),
  subject: String (required),
  fileUrl: String (required),
  description: String (optional, max 500 chars),
  uploadedBy: ObjectId (ref: User),
  views: Number (default: 0),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Indexes
- uploadedBy: Faster queries for teacher's notes
- subject: Faster subject filtering
- createdAt: Faster sorting by date

---

## ⚙️ Error Handling

All errors return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing fields, invalid data)
- `401` - Unauthorized (missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

---

## 🚀 Key Features

✅ **Upload Notes** - Teachers can upload PDF files with title and subject
✅ **View All Notes** - Students can browse all available notes
✅ **Get My Notes** - Teachers see only their uploaded notes
✅ **Delete Notes** - Teachers can delete their own notes
✅ **Update Notes** - Teachers can edit note title/subject
✅ **Authentication** - Secure token-based authentication
✅ **Authorization** - Role-based access control
✅ **File Management** - Automatic file cleanup on deletion
✅ **Database Indexes** - Optimized queries for performance
✅ **Error Handling** - Comprehensive error responses
