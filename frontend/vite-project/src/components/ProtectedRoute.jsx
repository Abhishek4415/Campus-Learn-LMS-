// Import Navigate to redirect users to another page
import { Navigate } from 'react-router-dom'

// This component protects private pages
function ProtectedRoute({ children }) {

  // Get token from browser storage
  const token = localStorage.getItem('token')

  // If token does not exist, user is not logged in
  if (!token) {

    // Redirect user to login page
    return <Navigate to="/login" />
  }

  // If token exists, allow access to the page
  return children
}

// Export so it can be used in routing
export default ProtectedRoute
