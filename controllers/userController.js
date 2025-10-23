const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const { sendOTPViaTwilio, verifyOTPViaTwilio } = require('../utils/otpService');
const { generateToken } = require('../utils/tokenUtils');

// =================== Send OTP ===================
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number required',
      });
    }

    const otpResponse = await sendOTPViaTwilio(phone);

    if (otpResponse.success) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your phone',
        phone,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }
  } catch (error) {
    console.error('Send OTP Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================== Verify OTP & Login ===================
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP required',
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number required',
      });
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    const verifyResponse = await verifyOTPViaTwilio(phone, otp);

    if (!verifyResponse.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Create or update user
    let user = await User.findOneAndUpdate(
      { phone },
      {
        phone,
        isPhoneVerified: true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Ensure UserProfile exists
    let profile = await UserProfile.findOne({ userId: user._id });

    if (!profile) {
      try {
        profile = await UserProfile.create({ userId: user._id });
      } catch (err) {
        console.error('UserProfile creation failed:', err.message);
        // Optional: return error or continue without profile
      }
    }

    const token = generateToken(user._id, 'user');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
      },
      // Optional: include profile if frontend needs it
      // profile,
    });
  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
