// Backend/models/submission.js
import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Submission link (Google Drive, GitHub, etc.)
  submissionLink: {
    type: String,
    required: true,
    trim: true
  },
  
  // Optional message
  message: {
    type: String,
    maxlength: 500
  },
  
  // Submission status
  status: {
    type: String,
    enum: ['submitted', 'late', 'reviewed'],
    default: 'submitted'
  },
  
  // Teacher feedback
  feedback: {
    type: String,
    maxlength: 1000
  },
  
  grade: {
    type: String,
    maxlength: 50
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  }
  
}, { timestamps: true })

// Unique constraint: One submission per student per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true })

export default mongoose.model('Submission', submissionSchema)