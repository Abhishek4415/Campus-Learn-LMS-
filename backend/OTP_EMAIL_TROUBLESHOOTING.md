# OTP Email Troubleshooting (CampusLearn)

## Context
Frontend registration page called:

- `POST /api/auth/register/send-otp`

and OTP email sending failed at different stages.

## Errors Faced

### 1) `404 Not Found` on `/api/auth/register/send-otp`
Example:

- `POST https://campus-learn-lms.onrender.com/api/auth/register/send-otp 404`

Root cause:

- Deployed backend was on an older build without new OTP routes.

Fix:

- Added OTP routes in `backend/routes/authRoutes.js`.
- Redeploy backend service after pushing latest code.

---

### 2) `ECONNREFUSED ::1:587`
Example:

- `connect ECONNREFUSED ::1:587`

Root cause:

- SMTP host/credentials were not loaded at runtime, so nodemailer tried localhost SMTP.

Fix:

- Updated `backend/server.js` to load env via absolute path:
  - `dotenv.config({ path: path.join(__dirname, '.env') })`
- Normalized env parsing in `authRoutes.js` using trimmed values.

---

### 3) Gmail `530 5.7.0 Authentication Required`
Example:

- `Mail command failed ... 530 5.7.0 Authentication Required ... command: 'MAIL FROM'`

Root causes:

- Gmail app-password/auth policy mismatch.
- Transporter initialization timing in ESM import order.
- Envelope sender mismatch (`MAIL FROM`) with Gmail rules.

Fixes:

- Use Gmail App Password (16-char) for `SMTP_PASS`.
- Create transporter lazily at send time (not module-load time).
- Force sender/envelope to authenticated mailbox:
  - `from: SMTP_USER`
  - `envelope.from: SMTP_USER`
- Kept `SMTP_USER` and `SMTP_FROM` aligned to same account.

---

## Debug Endpoint Added (Temporary)

- `GET /api/auth/debug-smtp`

Purpose:

- Verify runtime SMTP config (masked) and run `transporter.verify()`.

Expected success response:

- `"message": "SMTP configuration is valid"`

Important:

- Remove this endpoint after final verification in production.

## Final Working `.env` SMTP Shape

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your16charapppassword
SMTP_FROM=yourgmail@gmail.com
```

## Operational Notes

- Restart backend after every `.env` change.
- If frontend is local (`localhost`) but backend is deployed, ensure route parity and correct `VITE_API_URL`.
- For deployment, always redeploy backend when auth routes/middleware are changed.
