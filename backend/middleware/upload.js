import multer from 'multer'
import path from 'path'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

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
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        if (ext !== '.pdf') {
            return cb(new Error('Only PDFs allowed'))
        }
        cb(null, true)
    }
})

export default upload
