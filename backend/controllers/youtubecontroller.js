// import axios from 'axios'

// export const getYoutubeVideos = async (req, res) => {
//   try {
//     const { topic } = req.body

//     const response = await axios.post(
//       'http://127.0.0.1:8000/youtube',
//       // 'https://campus-learn-lms-1.onrender.com/youtube',
      
//       { topic }
//     )

//     res.json(response.data)
//   } catch (error) {
//     res.status(500).json({ message: 'YouTube mode failed' })
//   }
// }


import axios from 'axios'

export const getYoutubeVideos = async (req, res) => {
  try {
    const { topic, language, duration, recent } = req.body

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' })
    }

    // Call Python backend
    const response = await axios.post(
      'http://127.0.0.1:8000/youtube',
      {
        topic,
        language,
        duration,
        recent
      }
    )

    res.status(200).json({
      success: true,
      videos: response.data.videos
    })

  } catch (error) {
    console.error(error.message)

    res.status(500).json({
      success: false,
      message: 'YouTube search failed'
    })
  }
}