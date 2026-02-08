import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import UploadNotes from './pages/UploadNotes'
import TeacherRoute from './components/TeacherRoute'
import ManageNotes from './pages/ManageNotes'
import StudentNotes from './pages/StudentNotes'
import Chatbot from './pages/Chatbot'
import YTMode from './pages/YtMode'
import TeacherSubjects from './pages/TeacherSubject'
import TeacherTopics from './pages/TeacherTopic'
import StudentTopics from './pages/StudentTopics'
import StudentSubjects from './pages/studentSubject'
import TeacherAnalytics from './pages/teacherAnalytics'
import TeacherSubjectAnalytics from './pages/teacherSubjectAnalytics'
import CreateGroupChat from './pages/CreateGroupChat'
import StudentGroups from './pages/StudentGroup'
import GroupChat from './pages/GroupChat'
import TeacherGroups from './pages/TeacherGroups'



function App() {
  return (
    <>
      <Navbar />
      <Routes>

        {/* Public routes */}
        <Route path="/" element={
          <Home />

        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected route example */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <TeacherRoute>
              <UploadNotes />
            </TeacherRoute>
          }
        />
        <Route
          path="/managenotes"
          element={
            <TeacherRoute>
              <ManageNotes />
            </TeacherRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <StudentNotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/yt-mode"
          element={
            <ProtectedRoute>
              <YTMode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/subjects"
          element={
            <ProtectedRoute role="teacher">
              <TeacherSubjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/subjects/:subjectId"
          element={
            <ProtectedRoute role="teacher">
              <TeacherTopics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute role="student">
              <StudentSubjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/subjects/:subjectId"
          element={
            <ProtectedRoute role="student">
              <StudentTopics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/analytics"
          element={
            <ProtectedRoute role="teacher">
              <TeacherAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/analytics/:subjectId"
          element={
            <ProtectedRoute role="teacher">
              <TeacherSubjectAnalytics />
            </ProtectedRoute>
          }
        />

        {/* MESSAGE */}
        <Route path="/create-group" element={
          <TeacherRoute><CreateGroupChat /></TeacherRoute>
        } />

        <Route path="/student-groups" element={
          <ProtectedRoute><StudentGroups /></ProtectedRoute>
        } />

        <Route path="/chat/:groupId" element={
          <ProtectedRoute><GroupChat /></ProtectedRoute>
        } />

          {/* Teacher Routes */}
          <Route
            path="/teacher-groups"
            element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherGroups />
              </ProtectedRoute>
            }
          />








      </Routes>
    </>
  )
}

export default App
