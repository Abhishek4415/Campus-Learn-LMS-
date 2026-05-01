// Backend/routes/authRoutes.js
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import dns from 'node:dns'
import nodemailer from 'nodemailer'
import User from '../models/user.js'
import GroupChat from '../models/groupChat.js'
import RegistrationOtp from '../models/registrationOtp.js'
import authMiddleware, { createRequestThrottle } from '../middleware/authMiddleware.js'

const router = express.Router()

// Prefer IPv4 first to avoid IPv6 ENETUNREACH on some hosts (e.g. Render).
dns.setDefaultResultOrder('ipv4first')
const validCollegeNames = ['kr mangalam university']
const validDepartments = ['computer science']
const validYears = [2026, 2027, 2028, 2029, 2030]
const validSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const emailPattern = /^\d{10}@krmu\.edu\.in$/i
const generalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const rollNumberPattern = /^\d{10}$/
const phonePattern = /^\d{10}$/
const OTP_EXPIRY_MS = 5 * 60 * 1000
const OTP_RESEND_COOLDOWN_MS = 30 * 1000
const OTP_MAX_VERIFY_ATTEMPTS = 5
const OTP_MAX_SEND_PER_HOUR = 6

const normalizeEmail = (email = '') => email.trim().toLowerCase()
const normalizeText = (value = '') => value.trim()
const isAllowed = (value, allowedList) =>
  allowedList.includes(String(value || '').trim().toLowerCase())

const createOtp = () => String(crypto.randomInt(100000, 1000000))
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex')
const env = (key, fallback = '') => String(process.env[key] ?? fallback).trim()
const gmailAppPassword = () => env('SMTP_PASS').replace(/\s+/g, '')

const getOtpTransporter = () =>
  nodemailer.createTransport({
    host: env('SMTP_HOST', 'smtp.gmail.com'),
    port: Number(env('SMTP_PORT', '587')),
    secure: false,
    family: 4,
    auth: env('SMTP_USER') && gmailAppPassword()
      ? { user: env('SMTP_USER'), pass: gmailAppPassword() }
      : undefined
  })

const sendOtpEmail = async ({ email, otp }) => {
  if (!env('SMTP_HOST') || !env('SMTP_USER') || !gmailAppPassword()) {
    throw new Error('Email service is not configured')
  }

  const otpTransporter = getOtpTransporter()

  await otpTransporter.sendMail({
    from: env('SMTP_USER'),
    envelope: {
      from: env('SMTP_USER'),
      to: [email]
    },
    to: email,
    subject: 'CampusLearn Registration OTP',
    text: `Your CampusLearn OTP is ${otp}. It expires in 5 minutes.`
  })
}

router.get('/debug-smtp', async (req, res) => {
  const smtp = {
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT', '587')),
    user: env('SMTP_USER'),
    from: env('SMTP_FROM') || env('SMTP_USER'),
    passLength: gmailAppPassword().length
  }

  try {
    const otpTransporter = getOtpTransporter()
    await otpTransporter.verify()
    return res.json({ message: 'SMTP configuration is valid', smtp })
  } catch (error) {
    return res.status(500).json({
      message: 'SMTP verification failed',
      smtp,
      error: error.message
    })
  }
})

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

const otpSendThrottle = createRequestThrottle({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyBuilder: (req) => `otp-send:${req.ip || 'unknown'}:${normalizeEmail(req.body?.email || '')}`
})

const otpVerifyThrottle = createRequestThrottle({
  windowMs: 60 * 1000,
  maxRequests: 20,
  keyBuilder: (req) => `otp-verify:${req.ip || 'unknown'}:${normalizeEmail(req.body?.email || '')}`
})

router.post('/register/send-otp', otpSendThrottle, async (req, res) => {
  try {
    const { errors, value } = validateRegistrationBody(req.body)
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors })
    }

    const { email } = value
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const now = new Date()
    const record = await RegistrationOtp.findOne({ email })

    if (record?.lastOtpSentAt && now.getTime() - new Date(record.lastOtpSentAt).getTime() < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now.getTime() - new Date(record.lastOtpSentAt).getTime())) / 1000)
      return res.status(429).json({ message: `Please wait ${waitSeconds}s before resending OTP.` })
    }

    const firstRequestAt = record?.firstOtpRequestAt ? new Date(record.firstOtpRequestAt) : now
    const minutesSinceFirstRequest = now.getTime() - firstRequestAt.getTime()
    const sendCount = minutesSinceFirstRequest > 60 * 60 * 1000 ? 0 : (record?.otpSendCount || 0)

    if (sendCount >= OTP_MAX_SEND_PER_HOUR) {
      return res.status(429).json({ message: 'Too many OTP requests. Try again in an hour.' })
    }

    const otp = createOtp()
    const otpHash = hashOtp(otp)
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS)

    await RegistrationOtp.findOneAndUpdate(
      { email },
      {
        email,
        otpHash,
        expiresAt,
        verified: false,
        verifiedAt: null,
        verifyAttempts: 0,
        firstOtpRequestAt: minutesSinceFirstRequest > 60 * 60 * 1000 ? now : firstRequestAt,
        lastOtpSentAt: now,
        otpSendCount: sendCount + 1
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    await sendOtpEmail({ email, otp })
    return res.json({ message: 'OTP sent successfully', expiresInSeconds: 300, resendCooldownSeconds: 30 })
  } catch (error) {
    console.error('Send OTP error:', error)
    const isNetworkError = ['ESOCKET', 'ENETUNREACH', 'EHOSTUNREACH', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error?.code)
    const message = isNetworkError ? 'Email service is temporarily unreachable. Please try again in a moment.' : 'Failed to send OTP'
    return res.status(500).json({ message })
  }
})

router.post('/register/verify-otp', otpVerifyThrottle, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const otp = normalizeText(req.body.otp)

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    const record = await RegistrationOtp.findOne({ email })
    if (!record) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' })
    }

    if (record.verified) {
      const otpToken = jwt.sign(
        { email, purpose: 'register-email-verified' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '10m' }
      )
      return res.json({ message: 'Email already verified', otpToken })
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      await RegistrationOtp.deleteOne({ email })
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' })
    }

    if (record.verifyAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      await RegistrationOtp.deleteOne({ email })
      return res.status(429).json({ message: 'Maximum OTP attempts exceeded. Request a new OTP.' })
    }

    const isOtpValid = hashOtp(otp) === record.otpHash
    if (!isOtpValid) {
      record.verifyAttempts += 1
      await record.save()
      const attemptsLeft = Math.max(OTP_MAX_VERIFY_ATTEMPTS - record.verifyAttempts, 0)
      return res.status(400).json({ message: `Invalid OTP. ${attemptsLeft} attempt(s) left.` })
    }

    record.verified = true
    record.verifiedAt = new Date()
    record.otpHash = hashOtp(crypto.randomBytes(32).toString('hex'))
    await record.save()

    const otpToken = jwt.sign(
      { email, purpose: 'register-email-verified' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '10m' }
    )

    return res.json({ message: 'OTP verified successfully', otpToken })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return res.status(500).json({ message: 'Failed to verify OTP' })
  }
})

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

    const otpToken = normalizeText(req.body.otpToken)
    if (!otpToken) {
      return res.status(400).json({ message: 'Email verification is required before registration' })
    }

    let decodedOtpToken
    try {
      decodedOtpToken = jwt.verify(otpToken, process.env.JWT_SECRET || 'your-secret-key')
    } catch {
      return res.status(401).json({ message: 'Invalid or expired OTP verification token' })
    }

    if (decodedOtpToken.purpose !== 'register-email-verified' || normalizeEmail(decodedOtpToken.email) !== email) {
      return res.status(401).json({ message: 'OTP verification token does not match this email' })
    }

    const otpRecord = await RegistrationOtp.findOne({ email })
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({ message: 'Email is not verified. Please verify OTP first.' })
    }

    if (!otpRecord.verifiedAt || Date.now() - new Date(otpRecord.verifiedAt).getTime() > 10 * 60 * 1000) {
      await RegistrationOtp.deleteOne({ email })
      return res.status(400).json({ message: 'Verification session expired. Please verify OTP again.' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

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
    await RegistrationOtp.deleteOne({ email })

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

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

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

