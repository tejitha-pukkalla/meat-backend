const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
// User model
phone: {
  type: String,
  required: true,
  unique: true,
  match: /^[0-9]{10}$/,
},

otp: { type: String, required: true },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  is_active: {
  type: Boolean,
  default: true,  
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);




