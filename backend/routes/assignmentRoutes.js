// Backend/routes/assignmentRoutes.js
import express from 'express'
import Assignment from '../models/assignment.js'
import Submission from '../models/submission.js'
import User from '../models/user.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// ==========================================
// CREATE ASSIGNMENT (Teacher Only)
// ==========================================
router.post('/create', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create assignments' })
    }

    const { title, description, assignmentDriveLink, passingYear, department, section, dueDate } = req.body

    // Validation
    if (!title || !description || !assignmentDriveLink || !passingYear || !department || !section || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    let parsedDriveLink
    try {
      parsedDriveLink = new URL(assignmentDriveLink)
    } catch {
      return res.status(400).json({ message: 'Please provide a valid assignment Drive link' })
    }

    if (!['http:', 'https:'].includes(parsedDriveLink.protocol)) {
      return res.status(400).json({ message: 'Drive link must start with http or https' })
    }

    // Find matching students
    const students = await User.find({
      role: 'student',
      passingYear,
      department,
      section
    }).select('_id')

    const studentIds = students.map(s => s._id)

    // Create assignment
    const assignment = new Assignment({
      title,
      description,
      assignmentDriveLink: parsedDriveLink.toString(),
      passingYear,
      department,
      section,
      dueDate: new Date(dueDate),
      createdBy: req.userId,
      assignedTo: studentIds,
      totalStudents: studentIds.length
    })

    await assignment.save()

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
      studentsCount: studentIds.length
    })

  } catch (error) {
    console.error('Create assignment error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ==========================================
// GET TEACHER'S ASSIGNMENTS
// ==========================================
router.get('/my-assignments', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can access this' })
    }

    const assignments = await Assignment.find({ createdBy: req.userId })
      .sort({ createdAt: -1 })
      .lean()

    res.json(assignments)

  } catch (error) {
    console.error('Get assignments error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ==========================================
// GET STUDENT'S ASSIGNMENTS
// ==========================================
router.get('/student-assignments', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access this' })
    }

    // Find assignments assigned to this student
    const assignments = await Assignment.find({
      assignedTo: req.userId,
      isActive: true
    })
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 })
      .lean()

    // Check submission status for each assignment
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignmentId: assignment._id,
          studentId: req.userId
        })

        return {
          ...assignment,
          hasSubmitted: !!submission,
          submission: submission || null
        }
      })
    )

    res.json(assignmentsWithStatus)

  } catch (error) {
    console.error('Get student assignments error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ==========================================
// GET ASSIGNMENT DETAILS WITH SUBMISSIONS
// ==========================================
router.get('/:id/submissions', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view submissions' })
    }

    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email passingYear department section')

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    // Check ownership
    if (assignment.createdBy._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Get all submissions
    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 })

    // Create submission map
    const submissionMap = new Map()
    submissions.forEach(sub => {
      submissionMap.set(sub.studentId._id.toString(), sub)
    })

    // List of students with submission status
    const studentsWithStatus = assignment.assignedTo.map(student => {
      const submission = submissionMap.get(student._id.toString())
      return {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email
        },
        hasSubmitted: !!submission,
        submission: submission || null,
        isLate: submission && new Date(submission.submittedAt) > new Date(assignment.dueDate)
      }
    })

    // Separate submitted and not submitted
    const submitted = studentsWithStatus.filter(s => s.hasSubmitted)
    const notSubmitted = studentsWithStatus.filter(s => !s.hasSubmitted)

    res.json({
      assignment,
      stats: {
        total: assignment.totalStudents,
        submitted: submitted.length,
        notSubmitted: notSubmitted.length,
        submissionRate: assignment.totalStudents > 0 
          ? ((submitted.length / assignment.totalStudents) * 100).toFixed(1)
          : 0
      },
      submitted,
      notSubmitted
    })

  } catch (error) {
    console.error('Get submissions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ==========================================
// SUBMIT ASSIGNMENT (Student)
// ==========================================
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can submit' })
    }

    const { submissionLink, message } = req.body

    if (!submissionLink) {
      return res.status(400).json({ message: 'Submission link is required' })
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    // Check if student is assigned
    const isAssigned = assignment.assignedTo.some(
      id => id.toString() === req.userId
    )
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned this assignment' })
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId: req.params.id,
      studentId: req.userId
    })

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.submissionLink = submissionLink
      existingSubmission.message = message
      existingSubmission.submittedAt = new Date()
      existingSubmission.status = new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted'
      await existingSubmission.save()

      res.json({
        message: 'Submission updated successfully',
        submission: existingSubmission
      })
    } else {
      // Create new submission
      const submission = new Submission({
        assignmentId: req.params.id,
        studentId: req.userId,
        submissionLink,
        message,
        status: new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted'
      })

      await submission.save()

      // Update assignment stats
      assignment.submittedCount += 1
      await assignment.save()

      res.status(201).json({
        message: 'Assignment submitted successfully',
        submission
      })
    }

  } catch (error) {
    console.error('Submit assignment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ==========================================
// DELETE ASSIGNMENT (Teacher)
// ==========================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete' })
    }

    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    if (assignment.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Delete all submissions
    await Submission.deleteMany({ assignmentId: req.params.id })

    // Delete assignment
    await Assignment.findByIdAndDelete(req.params.id)

    res.json({ message: 'Assignment deleted successfully' })

  } catch (error) {
    console.error('Delete assignment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ==========================================
// ADD FEEDBACK (Teacher)
// ==========================================
router.post('/submission/:submissionId/feedback', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can give feedback' })
    }

    const { feedback, grade } = req.body

    const submission = await Submission.findById(req.params.submissionId)
      .populate({
        path: 'assignmentId',
        select: 'createdBy'
      })

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Check if teacher owns the assignment
    if (submission.assignmentId.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (typeof feedback !== 'undefined') {
      submission.feedback = feedback
    }
    if (typeof grade !== 'undefined') {
      submission.grade = String(grade).trim()
    }
    submission.status = 'reviewed'
    await submission.save()

    res.json({
      message: 'Feedback added successfully',
      submission
    })

  } catch (error) {
    console.error('Add feedback error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
