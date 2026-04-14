import multer from 'multer'
import path from 'path'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const requiredEnvKeys = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
]

const getMissingCloudinaryEnv = () =>
    requiredEnvKeys.filter((key) => !process.env[key] || !process.env[key].trim())

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        const originalName = path.parse(file.originalname).name
        const safeName = originalName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60)

        return {
            folder: 'campuslearn/notes',
            resource_type: 'raw',
            format: 'pdf',
            public_id: `${Date.now()}-${safeName}`
        }
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        if (ext !== '.pdf') {
            return cb(new Error('Only PDFs allowed'))
        }
        cb(null, true)
    }
})

export const ensureCloudinaryConfigured = (req, res, next) => {
    const missing = getMissingCloudinaryEnv()
    if (!missing.length) return next()

    return res.status(500).json({
        message: 'Cloudinary is not configured on server',
        missing
    })
}

const getUploadErrorStatus = (message = '') => {
    const m = message.toLowerCase()
    if (m.includes('must supply api_key') || m.includes('cloudinary')) return 500
    if (m.includes('file too large')) return 413
    return 400
}

export const handlePdfUpload = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
        if (!err) return next()

        console.error('Multer/Cloudinary upload error:', err.message || err)
        return res.status(getUploadErrorStatus(err.message)).json({
            message: err.message || 'Upload failed'
        })
    })
}

export default upload
