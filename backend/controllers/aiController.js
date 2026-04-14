import axios from 'axios'
import Note from '../models/note.js'
import Topic from '../models/topic.js'
import path from 'path'

const AI_BASE_URL = process.env.AI_BASE_URL || 'https://campus-learn-lms-1.onrender.com'

const isRemoteUrl = (value = '') => /^https?:\/\//i.test(value)

const toLoadPayload = (fileRef, reset = false) => {
  if (isRemoteUrl(fileRef)) {
    return { file_url: fileRef, reset }
  }
  return { file_path: path.resolve(fileRef), reset }
}

const getAllNoteFiles = async () => {
  const [notes, topics] = await Promise.all([
    Note.find({}, 'fileUrl').lean(),
    Topic.find({ notesFile: { $exists: true, $ne: '' } }, 'notesFile').lean()
  ])

  const uniqueFiles = new Set()

  for (const note of notes) {
    if (note.fileUrl) uniqueFiles.add(note.fileUrl)
  }

  for (const topic of topics) {
    if (topic.notesFile) uniqueFiles.add(topic.notesFile)
  }

  return Array.from(uniqueFiles)
}

const loadAllNotesToAIService = async () => {
  const files = await getAllNoteFiles()
  if (!files.length) return 0

  for (let i = 0; i < files.length; i += 1) {
    const payload = toLoadPayload(files[i], i === 0)
    await axios.post(`${AI_BASE_URL}/load`, payload, { timeout: 30000 })
  }

  return files.length
}

export const askAI = async (req, res) => {
  try {
    const { question } = req.body

    // 🔁 Ensure notes are loaded
    try {
      await axios.post(
        `${AI_BASE_URL}/ask`,
        { question },
        { timeout: 2000 }
      )
    } catch {
      // Load notes if AI says not loaded
      await loadAllNotesToAIService()
    }

    // Ask again after loading
    const response = await axios.post(`${AI_BASE_URL}/ask`, {
      question
    })

    res.json({ answer: response.data.answer })

  } catch (error) {
    console.log("AI ASK ERROR 👉", error.response?.data || error.message)
    res.status(500).json({ error: 'AI service failed' })
  }
}





// Load all notes into AI
export const loadNotesToAI = async (req, res) => {
  try {
    const loadedCount = await loadAllNotesToAIService()

    res.json({ message: 'Notes loaded into AI successfully', loadedCount })
} catch (error) {
  console.log("AI LOAD ERROR 👉", error.response?.data || error.message)
  res.status(500).json({ message: 'Failed to load notes into AI' })
}

}


