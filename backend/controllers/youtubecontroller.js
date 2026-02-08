import axios from 'axios'

export const getYoutubeVideos = async (req, res) => {
  try {
    const { topic } = req.body

    const response = await axios.post(
      'http://127.0.0.1:8000/youtube',
      { topic }
    )

    res.json(response.data)
  } catch (error) {
    res.status(500).json({ message: 'YouTube mode failed' })
  }
}
