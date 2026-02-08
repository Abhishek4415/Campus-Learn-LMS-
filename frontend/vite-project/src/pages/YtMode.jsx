import { useState } from 'react'
import { Search, Play } from 'lucide-react'
import API from '../services/api'

function YTMode() {
    const [topic, setTopic] = useState('')
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(false)
    const [language, setLanguage] = useState('hindi')
    const [duration, setDuration] = useState('all')
    const [recent, setRecent] = useState(false)


    const searchVideos = async () => {
        if (!topic.trim()) return

        setLoading(true)
        setVideos([])

        try {
            const res = await API.post(
                '/api/youtube/search',
                {
                    topic,
                    language,
                    duration,
                    recent
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )
            setVideos(res.data.videos)
        } catch {
            alert('Failed to load videos')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-blue-50 px-6 pt-12">


            {/* Search Bar Container */}
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-md">
                <div className="flex  gap-6">
                    {/* Search Input */}
                    <div className="flex items-center border border-gray-300 rounded-xl px-4 hover:border-blue-400 transition-colors w-[430px] duration-200">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Search for any topic... (e.g., React, Python, Machine Learning)"
                            className="w-full p-3 outline-none text-gray-700"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 flex-wrap items-center">
                        <select
                            onChange={(e) => setLanguage(e.target.value)}
                            className="border border-gray-300 px-4 py-3 outline-none rounded-xl text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 cursor-pointer"
                        >
                            <option value="english">English</option>
                            <option value="hindi">Hindi</option>
                        </select>

                        <select
                            onChange={(e) => setDuration(e.target.value)}
                            className="border border-gray-300 px-4 py-3 outline-none rounded-xl text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 cursor-pointer"
                        >
                            <option value="all">All Durations</option>
                            <option value="short">Short (&lt;10 min)</option>
                            <option value="medium">Medium (10–30 min)</option>
                            <option value="long">Long (&gt;30 min)</option>
                        </select>

                        <label className="flex items-center gap-2 border border-gray-300 px-4 py-3 rounded-xl text-gray-700 hover:border-blue-400 cursor-pointer transition-all duration-200">
                            <input
                                type="checkbox"
                                onChange={(e) => setRecent(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-200 cursor-pointer"
                            />
                            <span className="font-medium">Recent Only</span>
                        </label>
                    </div>

                    {/* Button */}
                    <button
                        onClick={searchVideos}
                        className="flex items-center gap-2 bg-blue-800 px-6 py-3 rounded-xl text-white hover:bg-blue-500 transition"
                    >
                        <Play className="w-4 h-4" />
                        Search
                    </button>

                </div>
            </div>

            {/* Center Section */}
            {!loading && videos.length === 0 && (
                <div className="flex flex-col items-center mt-24 text-center">

                    <div className="bg-blue-100 p-6 rounded-full shadow">
                        <Play className="w-10 h-10 text-blue-600" />
                    </div>

                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Start Your Learning Journey
                    </h2>

                    <p className="mt-2 text-gray-600 max-w-xl">
                        Search for any topic to discover curated educational videos from YouTube
                    </p>

                    {/* Tags */}
                    <div className="mt-8 flex flex-wrap gap-3 justify-center">
                        {[
                            'React Tutorials',
                            'Python Programming',
                            'Machine Learning',
                            'Web Development',
                            'Data Science'
                        ].map((t, i) => (
                            <button
                                key={i}
                                onClick={() => setTopic(t)}
                                className="px-5 py-2 bg-white rounded-full shadow text-gray-700 hover:bg-blue-100 transition"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <p className="text-center mt-20 text-gray-600">
                    Searching best videos for you...
                </p>
            )}

            {/* Video List (unchanged logic) */}
            {/* Video Results */}
            <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((v, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                    >
                        {/* Thumbnail + Duration */}
                        <div className="relative">
                            <img
                                src={v.thumbnail || 'https://via.placeholder.com/400x225'}
                                alt={v.title}
                                className="w-full h-48 object-cover"
                            />

                            {v.duration && (
                                <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-0.5 rounded">
                                    {v.duration}
                                </span>
                            )}
                        </div>

                        {/* Video Info */}
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                                {v.title}
                            </h3>

                            <p className="text-sm text-gray-600 mt-1">
                                {v.channel}
                            </p>

                            <div className="text-xs text-gray-500 mt-1">
                                {v.views || '— views'} • {v.time || '— ago'}
                            </div>

                            <a
                                href={v.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-3 text-blue-600 text-sm font-medium hover:underline"
                            >
                                Watch on YouTube
                            </a>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    )
}

export default YTMode
