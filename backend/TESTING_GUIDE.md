# TESTING GUIDE - Backend Routes

## Prerequisites
- Backend server running: `npm run dev` (port 5000)
- MongoDB connected
- Valid JWT tokens for testing

---

## 1. TESTING DELETE NOTE

### Using Postman

**Setup:**
1. Open Postman
2. Create new request
3. Method: `DELETE`
4. URL: `http://localhost:5000/api/notes/:id`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Test Cases:**

#### ✅ Test 1: Successful Delete (Teacher)
```
DELETE http://localhost:5000/api/notes/607f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Expected Response (200):**
```json
{
  "message": "Note deleted successfully"
}
```

**What Happens:**
- PDF file deleted from /uploads folder
- Note document removed from MongoDB
- Note disappears from teacher's list

---

#### ❌ Test 2: Unauthorized Delete (Student)
```
DELETE http://localhost:5000/api/notes/607f1f77bcf86cd799439011
Authorization: Bearer STUDENT_TOKEN
```

**Expected Response (403):**
```json
{
  "message": "Only teachers can delete notes"
}
```

---

#### ❌ Test 3: Delete Non-Existent Note
```
DELETE http://localhost:5000/api/notes/invalid_id_12345
Authorization: Bearer TEACHER_TOKEN
```

**Expected Response (404):**
```json
{
  "message": "Note not found"
}
```

---

#### ❌ Test 4: Delete Another Teacher's Note
```
DELETE http://localhost:5000/api/notes/OTHER_TEACHER_NOTE_ID
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (403):**
```json
{
  "message": "You can only delete your own notes"
}
```

---

## 2. TESTING VIEW ALL NOTES (Students)

### Using Postman

**Setup:**
1. Method: `GET`
2. URL: `http://localhost:5000/api/notes/all-notes`

**Headers:**
```
Authorization: Bearer STUDENT_TOKEN
```

#### ✅ Test 1: Get All Notes
```
GET http://localhost:5000/api/notes/all-notes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Expected Response (200):**
```json
[
  {
    "_id": "607f1f77bcf86cd799439011",
    "title": "Introduction to Calculus",
    "subject": "Mathematics",
    "fileUrl": "uploads/calculus_intro.pdf",
    "uploadedBy": {
      "_id": "607f1f77bcf86cd799439012",
      "name": "Mr. John Doe",
      "email": "john@school.com"
    },
    "description": "Covers basic calculus concepts",
    "views": 45,
    "createdAt": "2024-12-24T10:30:00.000Z",
    "updatedAt": "2024-12-24T10:30:00.000Z"
  }
]
```

---

#### ✅ Test 2: Alternative Endpoint
```
GET http://localhost:5000/api/notes/
Authorization: Bearer STUDENT_TOKEN
```

**Expected Response:** Same as above

---

## 3. TESTING SHOW MY NOTES (Teachers)

### Using Postman

**Setup:**
1. Method: `GET`
2. URL: `http://localhost:5000/api/notes/my-notes`

**Headers:**
```
Authorization: Bearer TEACHER_TOKEN
```

#### ✅ Test 1: Get My Notes (Teacher)
```
GET http://localhost:5000/api/notes/my-notes
Authorization: Bearer TEACHER_TOKEN
```

**Expected Response (200):**
```json
[
  {
    "_id": "607f1f77bcf86cd799439011",
    "title": "My First Note",
    "subject": "Mathematics",
    "fileUrl": "uploads/note_1.pdf",
    "uploadedBy": {
      "_id": "607f1f77bcf86cd799439012",
      "name": "Mr. Teacher",
      "email": "teacher@school.com"
    },
    "views": 15,
    "createdAt": "2024-12-24T09:00:00.000Z"
  }
]
```

**Note:** Only shows notes uploaded by this teacher

---

#### ❌ Test 2: Student Tries to Access My-Notes
```
GET http://localhost:5000/api/notes/my-notes
Authorization: Bearer STUDENT_TOKEN
```

**Expected Response (403):**
```json
{
  "message": "Only teachers can view this"
}
```

---

## 4. TESTING GET SINGLE NOTE

### Using Postman

**Setup:**
1. Method: `GET`
2. URL: `http://localhost:5000/api/notes/:id`

#### ✅ Test 1: Get Single Note
```
GET http://localhost:5000/api/notes/607f1f77bcf86cd799439011
Authorization: Bearer TOKEN
```

**Expected Response (200):**
```json
{
  "_id": "607f1f77bcf86cd799439011",
  "title": "Note Title",
  "subject": "Subject",
  "fileUrl": "uploads/note.pdf",
  "uploadedBy": {
    "_id": "607f1f77bcf86cd799439012",
    "name": "Teacher Name",
    "email": "teacher@school.com"
  },
  "views": 25,
  "createdAt": "2024-12-24T10:30:00.000Z"
}
```

---

## 5. TESTING UPDATE NOTE

### Using Postman

**Setup:**
1. Method: `PUT`
2. URL: `http://localhost:5000/api/notes/:id`
3. Body Type: JSON

**Headers:**
```
Authorization: Bearer TEACHER_TOKEN
Content-Type: application/json
```

#### ✅ Test 1: Update Own Note
```
PUT http://localhost:5000/api/notes/607f1f77bcf86cd799439011
Authorization: Bearer TEACHER_TOKEN
Content-Type: application/json

Body:
{
  "title": "Updated Title",
  "subject": "Updated Subject"
}
```

**Expected Response (200):**
```json
{
  "message": "Note updated successfully",
  "note": {
    "_id": "607f1f77bcf86cd799439011",
    "title": "Updated Title",
    "subject": "Updated Subject",
    "fileUrl": "uploads/note.pdf",
    "uploadedBy": "607f1f77bcf86cd799439012",
    "updatedAt": "2024-12-24T11:45:00.000Z"
  }
}
```

---

## 6. TESTING FILE UPLOAD

### Using Postman

**Setup:**
1. Method: `POST`
2. URL: `http://localhost:5000/api/notes/upload`
3. Body Type: form-data

**Headers:**
```
Authorization: Bearer TEACHER_TOKEN
```

**Form Data:**
```
key: title       | value: My Study Notes
key: subject     | value: Mathematics
key: file        | value: [Select PDF file]
```

#### ✅ Test 1: Successful Upload
```
POST http://localhost:5000/api/notes/upload
Authorization: Bearer TEACHER_TOKEN

Form Data:
title: Introduction to Calculus
subject: Mathematics
file: calculus.pdf (PDF file)
```

**Expected Response (200):**
```json
{
  "message": "Note uploaded successfully",
  "note": {
    "_id": "607f1f77bcf86cd799439099",
    "title": "Introduction to Calculus",
    "subject": "Mathematics",
    "fileUrl": "uploads/note_unique_name.pdf",
    "uploadedBy": "607f1f77bcf86cd799439012",
    "createdAt": "2024-12-24T12:00:00.000Z"
  }
}
```

---

## 7. USING CURL FOR TESTING

```bash
# Get all notes
curl -X GET http://localhost:5000/api/notes/all-notes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get my notes
curl -X GET http://localhost:5000/api/notes/my-notes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get single note
curl -X GET http://localhost:5000/api/notes/607f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete note
curl -X DELETE http://localhost:5000/api/notes/607f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update note
curl -X PUT http://localhost:5000/api/notes/607f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Title","subject":"New Subject"}'

# Upload note
curl -X POST http://localhost:5000/api/notes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Notes" \
  -F "subject=Math" \
  -F "file=@/path/to/file.pdf"
```

---

## 8. TESTING CHECKLIST

### Delete Functionality
- [ ] Teacher can delete own notes
- [ ] Student cannot delete notes
- [ ] Teacher cannot delete other teacher's notes
- [ ] Cannot delete non-existent note
- [ ] PDF file removed from disk
- [ ] Database record removed
- [ ] Frontend updates after deletion

### View All Notes
- [ ] Student can fetch all notes
- [ ] Returns all notes from all teachers
- [ ] Teacher info is populated
- [ ] Sorted by newest first
- [ ] Can search/filter properly

### My Notes
- [ ] Teacher can fetch only their notes
- [ ] Student cannot access /my-notes
- [ ] Returns only teacher's own notes
- [ ] Proper teacher info included

### Get Single Note
- [ ] Can fetch by valid ID
- [ ] Returns 404 for invalid ID
- [ ] Returns teacher info

### Update Note
- [ ] Teacher can update own notes
- [ ] Title and subject can be updated
- [ ] Cannot update other teacher's notes
- [ ] Cannot update non-existent note

### Upload Note
- [ ] Teacher can upload PDF
- [ ] File saved to disk
- [ ] Record created in database
- [ ] Non-PDF rejected
- [ ] File size validated

---

## 9. ERROR SCENARIOS TO TEST

```javascript
// Missing token
GET /api/notes/all-notes
// Expected: 401 Unauthorized

// Invalid token
GET /api/notes/all-notes
Authorization: Bearer invalid_token_xyz
// Expected: 401 Unauthorized

// Wrong role
DELETE /api/notes/id
Authorization: Bearer STUDENT_TOKEN
// Expected: 403 Forbidden

// Wrong owner
DELETE /api/notes/OTHER_TEACHERS_NOTE_ID
Authorization: Bearer YOUR_TOKEN
// Expected: 403 Forbidden

// Not found
DELETE /api/notes/invalid_id_xyz
Authorization: Bearer TOKEN
// Expected: 404 Not Found

// Invalid note ID format
GET /api/notes/not_a_valid_id
Authorization: Bearer TOKEN
// Expected: 500 Server Error (Mongoose validation)

// No file in upload
POST /api/notes/upload
Authorization: Bearer TEACHER_TOKEN
(no file in form data)
// Expected: 400 Bad Request - "No file uploaded"
```

---

## 10. REAL-WORLD TESTING FLOW

```
1. Register as Teacher
   POST /api/auth/register
   → Get token_teacher

2. Register as Student
   POST /api/auth/register
   → Get token_student

3. Teacher Uploads Note
   POST /api/notes/upload
   Auth: token_teacher
   → Get note_id_1

4. Student Views All Notes
   GET /api/notes/all-notes
   Auth: token_student
   → Should see note_id_1

5. Teacher Views My Notes
   GET /api/notes/my-notes
   Auth: token_teacher
   → Should see note_id_1

6. Student Tries to Delete (should fail)
   DELETE /api/notes/note_id_1
   Auth: token_student
   → Should get 403

7. Teacher Deletes Own Note
   DELETE /api/notes/note_id_1
   Auth: token_teacher
   → Should get 200 Success

8. Student Checks Again (should be gone)
   GET /api/notes/all-notes
   Auth: token_student
   → Should NOT see note_id_1
```
