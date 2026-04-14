// Backend/routes/authRoutes.js
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import GroupChat from '../models/groupChat.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()
const validCollegeNames = ['kr mangalam university']
const validDepartments = ['computer science']
const validYears = [2026, 2027, 2028, 2029, 2030]
const validSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const emailPattern = /^\d{10}@krmu\.edu\.in$/i
const generalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const rollNumberPattern = /^\d{10}$/
const phonePattern = /^\d{10}$/

const normalizeEmail = (email = '') => email.trim().toLowerCase()
const normalizeText = (value = '') => value.trim()
const isAllowed = (value, allowedList) =>
  allowedList.includes(String(value || '').trim().toLowerCase())

const validateRegistrationBody = (body) => {
  const errors = []
  const role = body.role === 'teacher' ? 'teacher' : 'student'
  const fullName = normalizeText(body.fullName)
  const email = normalizeEmail(body.email)
  const password = body.password || ''
  const collegeName = normalizeText(body.collegeName)
  const school = normalizeText(body.school)
  const department = normalizeText(body.department)
  const section = normalizeText(body.section).toUpperCase()
  const rollNumber = normalizeText(body.rollNumber)
  const phoneNumber = normalizeText(body.phoneNumber)
  const year = Number(body.year)

  if (!fullName) errors.push('Full name is required')
  if (!email) {
    errors.push('Email must not be empty')
  } else if (role === 'student' && !emailPattern.test(email)) {
    errors.push('Email must be in the format rollno@krmu.edu.in')
  } else if (role === 'teacher' && !generalEmailPattern.test(email)) {
    errors.push('Please enter a valid email address')
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }

  if (!department) {
    errors.push('Department is required')
  } else if (!isAllowed(department, validDepartments)) {
    errors.push('Invalid department')
  }

  if (role === 'student') {
    if (!school) {
      errors.push('School is required')
    }

    if (!rollNumber) {
      errors.push('Roll number must not be empty')
    } else if (!rollNumberPattern.test(rollNumber)) {
      errors.push('Roll number must be exactly 10 digits')
    }

    if (!body.year && body.year !== 0) {
      errors.push('Year is required')
    } else if (!validYears.includes(year)) {
      errors.push('Invalid year')
    }

    if (!collegeName) {
      errors.push('College name is required')
    } else if (!isAllowed(collegeName, validCollegeNames)) {
      errors.push('Invalid college name')
    }

    if (!validSections.includes(section)) {
      errors.push('Section must be one of A, B, C, D, E, F, G, H')
    }

    if (!phoneNumber) {
      errors.push('Phone number is required')
    } else if (!phonePattern.test(phoneNumber)) {
      errors.push('Phone number must be exactly 10 digits')
    }

    if (emailPattern.test(email)) {
      const [emailRoll] = email.split('@')
      if (rollNumber && emailRoll !== rollNumber) {
        errors.push('Roll number must match the email prefix')
      }
    }
  } else {
    if (!school) {
      errors.push('School is required')
    }
  }

  return {
    errors,
    value: {
      role,
      fullName,
      name: fullName,
      email,
      password,
      collegeName,
      school,
      department,
      section,
      rollNumber,
      phoneNumber,
      year
    }
  }
}

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { errors, value } = validateRegistrationBody(req.body)
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors })
    }

    const {
      role,
      fullName,
      name,
      email,
      password,
      collegeName,
      school,
      department,
      section,
      rollNumber,
      phoneNumber,
      year
    } = value

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      name,
      fullName,
      email,
      password: hashedPassword,
      role,
      department,
      school,
      ...(role === 'student' && {
        passingYear: year,
        section,
        collegeName,
        rollNumber,
        phoneNumber
      })
    })

    await user.save()

    // If student, auto-add to matching groups
    if (role === 'student') {
      const matchingGroups = await GroupChat.find({
        passingYear: year,
        department,
        section,
        school,
        isActive: true
      })

      if (matchingGroups.length > 0) {
        await GroupChat.updateMany(
          {
            passingYear: year,
            department,
            section,
            school,
            isActive: true
          },
          { $addToSet: { members: user._id } }
        )

        console.log(`Auto-added student ${user._id} to ${matchingGroups.length} groups`)
      }
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        passingYear: user.passingYear,
        year: user.passingYear,
        department: user.department,
        section: user.section,
        school: user.school,
        collegeName: user.collegeName,
        rollNumber: user.rollNumber,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const { password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        passingYear: user.passingYear,
        year: user.passingYear,
        department: user.department,
        section: user.section,
        school: user.school,
        collegeName: user.collegeName,
        rollNumber: user.rollNumber,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// GET CURRENT USER
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(401).json({ message: 'Invalid token' })
  }
})

// GET PROFILE (Authenticated)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
