// Backend/models/assignment.js
import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  assignmentDriveLink: {
    type: String,
    required: true,
    trim: true
  },
  
  // Assignment criteria (to target specific students)
  passingYear: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  
  // Deadline
  dueDate: {
    type: Date,
    required: true
  },
  
  // Teacher who created
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Students who should submit
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Stats
  totalStudents: {
    type: Number,
    default: 0
  },
  submittedCount: {
    type: Number,
    default: 0
  }
  
}, { timestamps: true })

// Indexes for fast queries
assignmentSchema.index({ createdBy: 1, createdAt: -1 })
assignmentSchema.index({ assignedTo: 1 })
assignmentSchema.index({ passingYear: 1, department: 1, section: 1 })

export default mongoose.model('Assignment', assignmentSchema)
