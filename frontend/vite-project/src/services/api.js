// Import Axios, a tool used to send HTTP requests
import axios from 'axios'

// Create an Axios instance with a fixed backend address
const API = axios.create({
  // Base URL of the backend server
  baseURL: 'https://campus-learn-lms.onrender.com'
})

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})
// Export this Axios instance so it can be used in other files
export default API
