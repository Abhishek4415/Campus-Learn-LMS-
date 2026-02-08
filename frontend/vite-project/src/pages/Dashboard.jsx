import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, Bot, Upload, FileText, Users, BarChart3, 
  TrendingUp, Award, Clock, ArrowRight, Sparkles,
  Target, CheckCircle, Calendar
} from 'lucide-react'
import API from '../services/api'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalNotes: '--',
    streak: '--',
    achievements: '--'
  })
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))

    API.get('/api/dashboard', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => setStats(res.data))
    .catch(err => console.error('Error fetching stats:', err))
  }, [])

  const studentFeatures = [
    {
      icon: BookOpen,
      title: 'View Notes',
      description: 'Access comprehensive study materials uploaded by teachers',
      action: () => navigate('/notes')
    },
    {
      icon: Bot,
      title: 'AI Chatbot',
      description: 'Get instant help with your syllabus and study questions',
      action: () => navigate('/chat')
    },
    {
      icon: Target,
      title: 'My Subjects',
      description: 'Track your progress across all enrolled subjects',
      action: () => navigate('/subjects')
    },
    {
      icon: Users,
      title: 'Group Chat',
      description: 'Collaborate with classmates and teachers in real-time',
      action: () => navigate('/student-groups')
    }
  ]

  const teacherFeatures = [
    {
      icon: Upload,
      title: 'Upload Notes',
      description: 'Share your study materials with students',
      action: () => navigate('/upload')
    },
    {
      icon: FileText,
      title: 'Manage Notes',
      description: 'Edit, organize, and manage your uploaded content',
      action: () => navigate('/managenotes')
    },
    {
      icon: BookOpen,
      title: 'Manage Subjects',
      description: 'Create and organize subject materials',
      action: () => navigate('/teacher/subjects')
    },
    {
      icon: Users,
      title: 'Group Chat',
      description: 'Create and manage student group discussions',
      action: () => navigate('/teacher-groups')
    }
  ]

  const adminFeatures = [
    {
      icon: Users,
      title: 'Manage Users',
      description: 'Control user accounts and permissions',
      action: () => alert('User management coming soon!')
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View detailed platform statistics and insights',
      action: () => alert('Analytics dashboard coming soon!')
    }
  ]

  const getFeatures = () => {
    switch (user?.role) {
      case 'student': return studentFeatures
      case 'teacher': return teacherFeatures
      case 'admin': return adminFeatures
      default: return []
    }
  }

  const getRoleBadge = () => {
    const badges = {
      student: { color: 'bg-blue-100 text-blue-800', icon: Award, label: 'Student' },
      teacher: { color: 'bg-indigo-100 text-indigo-800', icon: BookOpen, label: 'Teacher' },
      admin: { color: 'bg-purple-100 text-purple-800', icon: Users, label: 'Admin' }
    }
    return badges[user?.role] || badges.student
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const features = getFeatures()
  const roleBadge = getRoleBadge()
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Welcome Section */}
        <div className="mb-8 relative overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white"></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${roleBadge.color}`}>
                      <roleBadge.icon className="h-4 w-4 mr-1.5" />
                      {roleBadge.label}
                    </div>
                    <div className="flex items-center gap-1 text-white/80 text-sm">
                      <Calendar className="h-4 w-4" />
                      {currentDate}
                    </div>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Welcome back, {user.name}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {user.role === 'student' ? 'Ready to continue your learning journey?' : 
                     user.role === 'teacher' ? 'Ready to inspire minds today?' : 
                     'Manage your platform efficiently'}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span className="text-white font-semibold">Keep Going!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Notes</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-500 bg-clip-text text-transparent">
                  {stats.totalNotes}
                </p>
                <p className="text-xs text-gray-500 mt-1">Available resources</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Study Streak</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-500 bg-clip-text text-transparent">
                  {stats.streak}
                  <span className="text-lg ml-1">days</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Keep it up! 🔥</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Achievements</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-500 bg-clip-text text-transparent">
                  {stats.achievements}
                </p>
                <p className="text-xs text-gray-500 mt-1">Badges earned</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Award className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.role === 'student' ? 'Your Learning Tools' :
               user.role === 'teacher' ? 'Teaching Dashboard' : 
               'Admin Panel'}
            </h2>
            <div className="hidden md:block text-sm text-gray-600">
              {features.length} tools available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={feature.action}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Action Link */}
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-indigo-600">
                        Get Started
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Border Animation */}
                <div className="h-1 bg-gradient-to-r from-blue-300 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-indigo-600 font-semibold">
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Welcome to CampusLearn!</p>
                  <p className="text-xs text-gray-600 mt-0.5">Account created successfully</p>
                </div>
                <span className="text-xs text-gray-500">Just now</span>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">More activities coming soon</p>
                  <p className="text-xs text-gray-500 mt-0.5">Start using the platform to see your activity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            
            <div className="space-y-3">
              <a 
                href="/profile" 
                className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                <span className="text-sm font-medium">My Profile</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              
              <a 
                href="/settings" 
                className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                <span className="text-sm font-medium">Settings</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              
              <a 
                href="/help" 
                className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                <span className="text-sm font-medium">Help Center</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-sm text-blue-100 mb-2">Need assistance?</p>
              <button className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

//  bg-blue-500 
//  bg-gradient-to-r from-purple-500 to-violet-500
//  bg-gradient-to-r from-green-500 to-emerald-500
//  bg-gradient-to-r from-blue-500 to-indigo-500