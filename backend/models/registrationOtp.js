import mongoose from 'mongoose'

const registrationOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
)

registrationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('RegistrationOtp', registrationOtpSchema)
