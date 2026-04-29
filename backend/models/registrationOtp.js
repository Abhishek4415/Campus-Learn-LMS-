import mongoose from 'mongoose'

const registrationOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    verifyAttempts: { type: Number, default: 0 },
    otpSendCount: { type: Number, default: 0 },
    firstOtpRequestAt: { type: Date },
    lastOtpSentAt: { type: Date },
    verifiedAt: { type: Date }
  },
  { timestamps: true }
)

registrationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('RegistrationOtp', registrationOtpSchema)
