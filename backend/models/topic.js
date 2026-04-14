import mongoose from 'mongoose'

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },

  // 🔽 CONTENT DIRECTLY INSIDE TOPIC
  notesFile: String,
  notesFilePublicId: String,
  articleLinks: [String],
  youtubeLinks: [String],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

export default mongoose.model('Topic', topicSchema)
