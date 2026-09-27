const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  fullName: { type: String },
  password: { type: String, default: null },
  preferredCountry: { type: String, default: 'us' },
  preferredLanguage: { type: String, default: 'en' },
  roles: { type: [String], default: ['USER'] },
  enabled: { type: Boolean, default: true },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User', userSchema, 'users')