# OTP Verification Flow (Detailed)

## Overview

CampusLearn registration now uses a 3-step OTP flow:

1. `Send OTP`  
2. `Verify OTP`  
3. `Final Register` (allowed only after OTP verification)

This protects account creation by proving the user controls the email address.

---

## Files Involved

- `backend/routes/authRoutes.js`
- `backend/models/registrationOtp.js`
- `backend/middleware/authMiddleware.js`
- `frontend/vite-project/src/pages/Register.jsx`

---

## Data Model (`RegistrationOtp`)

The OTP state is stored in MongoDB in `registrationOtp` collection.

Key fields:

- `email` (unique)
- `otpHash` (SHA-256 hash, never plain OTP)
- `expiresAt` (OTP TTL; 5 minutes)
- `verified` (boolean)
- `verifiedAt` (timestamp when OTP was verified)
- `verifyAttempts` (incorrect attempt count)
- `lastOtpSentAt` (for 30s resend cooldown)
- `otpSendCount` + `firstOtpRequestAt` (hourly anti-spam cap)

TTL index:

- `expiresAt` has Mongo TTL index (`expireAfterSeconds: 0`) so expired OTP docs auto-delete.

---

## Endpoints and Flow

## 1) Send OTP

### Endpoint

- `POST /api/auth/register/send-otp`

### Input

Same registration fields as normal registration:

- `fullName`, `email`, `password`, `role`, `school`, `department`
- plus student-specific fields when `role=student`

### Backend logic

1. Validate full registration payload.
2. Reject if user already exists by `email`.
3. Enforce request throttle (IP + email key).
4. Enforce resend cooldown (`30s`).
5. Enforce hourly send limit (`OTP_MAX_SEND_PER_HOUR`).
6. Generate random 6-digit OTP.
7. Hash OTP with SHA-256 and store hash only.
8. Set `expiresAt = now + 5 minutes`.
9. Send email via SMTP.

### Success response

- `message: "OTP sent successfully"`
- `expiresInSeconds: 300`
- `resendCooldownSeconds: 30`

---

## 2) Verify OTP

### Endpoint

- `POST /api/auth/register/verify-otp`

### Input

- `email`
- `otp` (6 digits entered by user)

### Backend logic

1. Validate input.
2. Fetch OTP record by email.
3. Reject if not found (`OTP not found`).
4. Reject if expired (`OTP expired`) and clear record.
5. Reject if attempts exceeded (`max 5`) and clear record.
6. Compare `hash(enteredOtp)` with stored `otpHash`.
7. On mismatch:
   - increment `verifyAttempts`
   - return remaining attempts
8. On match:
   - set `verified = true`
   - set `verifiedAt = now`
   - replace `otpHash` with random hash (invalidates original OTP)
   - generate short-lived JWT `otpToken` (10 min)

### Success response

- `message: "OTP verified successfully"`
- `otpToken`

---

## 3) Final Registration

### Endpoint

- `POST /api/auth/register`

### Input

All registration fields + `otpToken` from step 2.

### Backend logic

1. Validate registration payload again (never trust client).
2. Require `otpToken`.
3. Verify `otpToken` signature and expiry.
4. Confirm token purpose is `register-email-verified`.
5. Confirm token email matches registration email.
6. Confirm DB record exists and `verified=true`.
7. Confirm verification session not stale (`verifiedAt` <= 10 minutes).
8. Create user only after all checks pass.
9. Delete OTP record after successful user creation.
10. Return login JWT + user profile.

This means registration cannot bypass OTP with frontend hacks.

---

## Frontend UX Flow (`Register.jsx`)

State flags:

- `otpSent`
- `otpVerified`
- `otpToken`
- `cooldownSeconds`
- loading states: `sendingOtp`, `verifyingOtp`, `registering`

Behavior:

1. User fills details.
2. Click `Send OTP`:
   - frontend validates fields
   - calls `/register/send-otp`
   - shows OTP input on success
3. OTP input + `Verify OTP` button appear.
4. `Resend OTP` enabled only after cooldown reaches `0`.
5. `Register` button remains disabled until `otpVerified && otpToken`.
6. On register, frontend sends final payload including `otpToken`.

No page reload is required.

---

## Security Controls Implemented

- Random OTP generation (`crypto.randomInt`)
- OTP hashing at rest (`sha256`)
- 5-minute OTP expiry
- 30-second resend cooldown
- rate limiting on OTP endpoints (throttle middleware)
- hourly OTP send cap
- incorrect OTP attempt cap (max retries)
- OTP invalidation after verify and after registration
- backend re-verification before user creation

---

## Common Failure Messages and Meaning

- `OTP not found`  
  User has not requested OTP or record expired/deleted.

- `OTP expired`  
  More than 5 minutes passed; request a new OTP.

- `Invalid OTP. X attempt(s) left.`  
  Wrong code entered.

- `Maximum OTP attempts exceeded`  
  Too many wrong attempts; must request fresh OTP.

- `Please wait XXs before resending OTP`  
  30-second cooldown active.

- `Invalid or expired OTP verification token`  
  `otpToken` expired/tampered/missing.

---

## Suggested Production Enhancements

- Move throttle state from in-memory map to Redis (works across multiple server instances).
- Use dedicated transactional email provider (SendGrid, SES, Resend) for better deliverability.
- Add structured audit logs for OTP events.
- Auto-clean temporary debug routes (do not keep in production).

