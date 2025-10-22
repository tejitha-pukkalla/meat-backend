const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/tokenUtils'); //
const { 
  sendAdminResetOTPViaTwilio, 
  verifyAdminResetOTPViaTwilio 
} = require('../utils/adminOtpService'); // NEW ADMIN OTP SERVICE


exports.registerAdmin = async (req, res) => {
  try {
    const { email, phone, password, confirmPassword } = req.body;

    // Validate all inputs
    if (!email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields required: email, phone, password, confirmPassword',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate phone number (10 digits)
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits',
      });
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if email already exists
    const existingAdminEmail = await Admin.findOne({ email });
    if (existingAdminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Check if phone already exists
    const existingAdminPhone = await Admin.findOne({ phone });
    if (existingAdminPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = new Admin({
      email,
      phone,
      password: hashedPassword,
    });

    await admin.save();

    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error('Register Admin Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  ADMIN LOGIN

exports.loginAdmin = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Validate inputs
    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone and password required',
      });
    }

    // Find admin by email or phone
    const admin = await Admin.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }

    // Generate token using existing tokenUtils
    const token = generateToken(admin._id, 'admin');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error('Login Admin Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  FORGOT PASSWORD - STEP 1: SEND OTP

exports.sendResetOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number required',
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits',
      });
    }

    // Find admin by phone
    const admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    // Check rate limiting (max 3 OTP attempts in 1 hour)
    if (admin.resetOTPAttempts >= 3) {
      const lastSentTime = new Date(admin.resetOTPLastSent);
      const timeDiff = Date.now() - lastSentTime;
      const oneHourInMs = 60 * 60 * 1000;

      if (timeDiff < oneHourInMs) {
        return res.status(429).json({
          success: false,
          message: 'Too many OTP requests. Try again later.',
        });
      } else {
        // Reset attempts after 1 hour
        admin.resetOTPAttempts = 0;
      }
    }

    // Send OTP via Twilio using admin-specific service
    const otpResponse = await sendAdminResetOTPViaTwilio(phone);

    if (otpResponse.success) {
      // Update OTP attempt counter
      admin.resetOTPAttempts += 1;
      admin.resetOTPLastSent = new Date();
      await admin.save();

      return res.status(200).json({
        success: true,
        message: 'Reset OTP sent successfully to your phone',
        phone,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }
  } catch (error) {
    console.error('Send Reset OTP Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  FORGOT PASSWORD - STEP 2: VERIFY OTP

exports.verifyResetOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate inputs
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP required',
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits',
      });
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    // Find admin
    const admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    // Verify OTP via Twilio using admin-specific service
    const verifyResponse = await verifyAdminResetOTPViaTwilio(phone, otp);

    if (verifyResponse.success) {
      // OTP verified - User can now proceed to reset password
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully. Please enter your new password.',
        phone,
        otpVerified: true,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        otpVerified: false,
      });
    }
  } catch (error) {
    console.error('Verify Reset OTP Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  FORGOT PASSWORD - STEP 3: RESET PASSWORD

exports.resetPassword = async (req, res) => {
  try {
    const { phone, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!phone || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields required: phone, newPassword, confirmPassword',
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits',
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Find admin
    const admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin password
    admin.password = hashedPassword;
    admin.resetOTPAttempts = 0;
    admin.resetOTPLastSent = null;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};