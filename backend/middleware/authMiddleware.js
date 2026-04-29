import jwt from 'jsonwebtoken'

const requestBuckets = new Map()

const now = () => Date.now()

const cleanupBucket = (bucket, windowMs) => bucket.filter((stamp) => now() - stamp < windowMs)

const getThrottleKey = (req, extraKey = '') => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown-ip'
  return `${ip}:${extraKey}`
}

export const createRequestThrottle = ({ windowMs, maxRequests, keyBuilder }) => {
  return (req, res, next) => {
    const key = keyBuilder ? keyBuilder(req) : getThrottleKey(req)
    const existing = requestBuckets.get(key) || []
    const validRequests = cleanupBucket(existing, windowMs)

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' })
    }

    validRequests.push(now())
    requestBuckets.set(key, validRequests)
    next()
  }
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch (error) {
    console.log('AUTH ERROR:', error.message)
    res.status(401).json({ message: 'Invalid token' })
  }
}

export default authMiddleware
