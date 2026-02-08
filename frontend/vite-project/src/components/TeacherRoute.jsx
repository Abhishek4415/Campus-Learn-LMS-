// Import Navigate to redirect users
import { Navigate } from 'react-router-dom'

// This component protects teacher-only pages
function TeacherRoute({ children }) {

  // Get token to check if user is logged in
  const token = localStorage.getItem('token')

  // Get user information from localStorage
  const user = JSON.parse(localStorage.getItem('user'))

  // If no token, user is not logged in
  if (!token) {
    return <Navigate to="/login" />   // Redirect to login page
  }

  // If user is logged in but not a teacher
  if (user?.role !== 'teacher') {
    return <Navigate to="/" />        // Redirect to home page
  }

  // If user is teacher, allow access to page
  return children
}

// Export component to use in routes
export default TeacherRoute


//===================================================WHAT===============

// What this component does (very simple)

// Checks login status

// Checks user role

// Allows only teachers

// Blocks students and admins