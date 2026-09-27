const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const { generateToken } = require('../utils/jwt')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// =================== 1. Standard Register ===================
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, preferredCountry } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      fullName: fullName || email.split('@')[0],
      email: email.toLowerCase(),
      password: hashedPassword,
      preferredCountry: preferredCountry || 'us',
    })

    const token = generateToken(user.email)

    res.status(201).json({
      token,
      email: user.email,
      fullName: user.fullName,
      preferredCountry: user.preferredCountry,
    })
  } catch (err) {
    console.error('Registration Error:', err)
    res.status(500).json({ message: 'Could not create your account' })
  }
})

// =================== 2. Standard Login ===================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user.email)

    res.json({
      token,
      email: user.email,
      fullName: user.fullName,
      preferredCountry: user.preferredCountry || 'us',
    })
  } catch (err) {
    console.error('Login Error:', err)
    res.status(500).json({ message: 'Invalid email or password' })
  }
})

// =================== 3. Google Login ===================
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body
    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' })
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const { email, name, sub: googleId } = payload

    let user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      user = await User.create({
        fullName: name,
        email: email.toLowerCase(),
        googleId,
        isVerified: true,
      })
    } else if (!user.googleId) {
      user.googleId = googleId
      await user.save()
    }

    const token = generateToken(user.email)

    res.json({
      token,
      email: user.email,
      fullName: user.fullName,
      preferredCountry: user.preferredCountry || 'us',
    })
  } catch (err) {
    console.error('Google Verification Error:', err)
    res.status(401).json({ message: 'Invalid Google ID token' })
  }
})

// =================== 4. Forgot Password (Generate OTP) ===================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      // Generate 6-digit numeric OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      user.resetOtp = await bcrypt.hash(otp, 10)
      user.resetOtpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

      await user.save()

      console.log('\n==================================================')
      console.log(`RESET OTP FOR ${user.email}: ${otp}`)
      console.log('==================================================\n')

      transporter
        .sendMail({
          from: `"NewsNow Support" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'NewsNow Password Reset OTP',
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #14171C; color: #E8E5DC;">
              <h2>Password Reset OTP</h2>
              <p>Your 6-digit verification code is:</p>
              <h1 style="color: #E0574A; letter-spacing: 4px;">${otp}</h1>
              <p>This code will expire in 10 minutes.</p>
            </div>
          `,
        })
        .catch((err) => console.error('Background Email Dispatch Error:', err))
    }

    res.json({ message: 'If that email is registered, an OTP code is on its way.' })
  } catch (err) {
    console.error('Forgot Password Error:', err)
    res.status(500).json({ message: 'Error processing request' })
  }
})

// =================== 5. Reset Password (Verify OTP) ===================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' })
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOtpExpires: { $gt: Date.now() },
    })

    if (!user || !user.resetOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' })
    }

    const isValidOtp = await bcrypt.compare(String(otp).trim(), user.resetOtp)
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid OTP code' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    user.resetOtp = undefined
    user.resetOtpExpires = undefined

    await user.save()

    res.json({ message: 'Password reset successfully. You can now sign in.' })
  } catch (err) {
    console.error('Reset Password Error:', err)
    res.status(500).json({ message: 'Error resetting password' })
  }
})

module.exports = router