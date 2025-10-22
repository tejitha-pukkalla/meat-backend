// const Admin = require('../models/Admin');
// const bcrypt = require('bcryptjs');
// const { generateToken } = require('../utils/tokenUtils'); //
// const { 
//   sendAdminResetOTPViaTwilio, 
//   verifyAdminResetOTPViaTwilio 
// } = require('../utils/adminOtpService'); // NEW ADMIN OTP SERVICE


// exports.registerAdmin = async (req, res) => {
//   try {
//     const { email, phone, password, confirmPassword } = req.body;

//     // Validate all inputs
//     if (!email || !phone || !password || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields required: email, phone, password, confirmPassword',
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid email format',
//       });
//     }

//     // Validate phone number (10 digits)
//     if (!/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number must be 10 digits',
//       });
//     }

//     // Validate passwords match
//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'Passwords do not match',
//       });
//     }

//     // Validate password length
//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password must be at least 6 characters',
//       });
//     }

//     // Check if email already exists
//     const existingAdminEmail = await Admin.findOne({ email });
//     if (existingAdminEmail) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered',
//       });
//     }

//     // Check if phone already exists
//     const existingAdminPhone = await Admin.findOne({ phone });
//     if (existingAdminPhone) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number already registered',
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create admin
//     const admin = new Admin({
//       email,
//       phone,
//       password: hashedPassword,
//       is_active: true, 
//     });

//     await admin.save();

//     return res.status(201).json({
//       success: true,
//       message: 'Admin registered successfully',
//       admin: {
//         id: admin._id,
//         email: admin.email,
//         phone: admin.phone,
//         is_active: admin.is_active,
//       },
//     });
//   } catch (error) {
//     console.error('Register Admin Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// //  ADMIN LOGIN

// exports.loginAdmin = async (req, res) => {
//   try {
//     const { emailOrPhone, password } = req.body;

//     // Validate inputs
//     if (!emailOrPhone || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email/Phone and password required',
//       });
//     }

//     // Find admin by email or phone
//     const admin = await Admin.findOne({
//       $or: [
//         { email: emailOrPhone.toLowerCase() },
//         { phone: emailOrPhone },
//       ],
//     });

//     if (!admin) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid email/phone or password',
//       });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid email/phone or password',
//       });
//     }

//      // ✅ Check if admin is active
//     if (!admin.is_active) {
//       return res.status(403).json({
//         success: false,
//         message: 'Admin account is inactive',
//       });
//     }

//     // Generate token using existing tokenUtils
//     const token = generateToken(admin._id, 'admin');

//     return res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       admin: {
//         id: admin._id,
//         email: admin.email,
//         phone: admin.phone,
//         is_active: admin.is_active,
//       },
//     });
//   } catch (error) {
//     console.error('Login Admin Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// //  FORGOT PASSWORD - STEP 1: SEND OTP

// exports.sendResetOTP = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     // Validate phone
//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number required',
//       });
//     }

//     if (!/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number must be 10 digits',
//       });
//     }

//     // Find admin by phone
//     const admin = await Admin.findOne({ phone });
//     if (!admin) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number not found',
//       });
//     }

//     // Check rate limiting (max 3 OTP attempts in 1 hour)
//     if (admin.resetOTPAttempts >= 3) {
//       const lastSentTime = new Date(admin.resetOTPLastSent);
//       const timeDiff = Date.now() - lastSentTime;
//       const oneHourInMs = 60 * 60 * 1000;

//       if (timeDiff < oneHourInMs) {
//         return res.status(429).json({
//           success: false,
//           message: 'Too many OTP requests. Try again later.',
//         });
//       } else {
//         // Reset attempts after 1 hour
//         admin.resetOTPAttempts = 0;
//       }
//     }

//     // Send OTP via Twilio using admin-specific service
//     const otpResponse = await sendAdminResetOTPViaTwilio(phone);

//     if (otpResponse.success) {
//       // Update OTP attempt counter
//       admin.resetOTPAttempts += 1;
//       admin.resetOTPLastSent = new Date();
//       await admin.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Reset OTP sent successfully to your phone',
//         phone,
//       });
//     } else {
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to send OTP. Please try again.',
//       });
//     }
//   } catch (error) {
//     console.error('Send Reset OTP Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// //  FORGOT PASSWORD - STEP 2: VERIFY OTP

// exports.verifyResetOTP = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;

//     // Validate inputs
//     if (!phone || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone and OTP required',
//       });
//     }

//     if (!/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number must be 10 digits',
//       });
//     }

//     if (!/^[0-9]{6}$/.test(otp)) {
//       return res.status(400).json({
//         success: false,
//         message: 'OTP must be 6 digits',
//       });
//     }

//     // Find admin
//     const admin = await Admin.findOne({ phone });
//     if (!admin) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number not found',
//       });
//     }

//     // Verify OTP via Twilio using admin-specific service
//     const verifyResponse = await verifyAdminResetOTPViaTwilio(phone, otp);

//     if (verifyResponse.success) {
//       // OTP verified - User can now proceed to reset password
//       return res.status(200).json({
//         success: true,
//         message: 'OTP verified successfully. Please enter your new password.',
//         phone,
//         otpVerified: true,
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or expired OTP',
//         otpVerified: false,
//       });
//     }
//   } catch (error) {
//     console.error('Verify Reset OTP Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// //  FORGOT PASSWORD - STEP 3: RESET PASSWORD

// exports.resetPassword = async (req, res) => {
//   try {
//     const { phone, newPassword, confirmPassword } = req.body;

//     // Validate inputs
//     if (!phone || !newPassword || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields required: phone, newPassword, confirmPassword',
//       });
//     }

//     if (!/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number must be 10 digits',
//       });
//     }

//     // Validate passwords match
//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'Passwords do not match',
//       });
//     }

//     // Validate password length
//     if (newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password must be at least 6 characters',
//       });
//     }

//     // Find admin
//     const admin = await Admin.findOne({ phone });
//     if (!admin) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number not found',
//       });
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update admin password
//     admin.password = hashedPassword;
//     admin.resetOTPAttempts = 0;
//     admin.resetOTPLastSent = null;
//     await admin.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Password reset successful. You can now login with your new password.',
//     });
//   } catch (error) {
//     console.error('Reset Password Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// THI SIS CHNAGE FROM ADMIJ TO VENDOR 




const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/tokenUtils');
const { 
  sendVendorResetOTPViaTwilio, 
  verifyVendorResetOTPViaTwilio 
} = require('../utils/vendorOtpService');

// ============================================
// VENDOR LOGIN (Password-based)
// ============================================
exports.loginVendor = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Validate inputs
    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone and password required',
      });
    }

    // Find vendor by email or phone
    const vendor = await Vendor.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }

    // Check if vendor is active
    if (vendor.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${vendor.status}. Contact Super Admin.`,
      });
    }

    // Update last login
    vendor.lastLogin = new Date();
    await vendor.save();

    // Generate token
    const token = generateToken(vendor._id, 'vendor');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: 'vendor',
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        status: vendor.status,
        profileCompletionPercentage: vendor.profileCompletionPercentage
      },
    });
  } catch (error) {
    console.error('Login Vendor Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// FORGOT PASSWORD - STEP 1: SEND OTP
// ============================================
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

    // Find vendor by phone
    const vendor = await Vendor.findOne({ phone });
    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    // Check rate limiting (max 3 OTP attempts in 1 hour)
    if (vendor.resetOTPAttempts >= 3) {
      const lastSentTime = new Date(vendor.resetOTPLastSent);
      const timeDiff = Date.now() - lastSentTime;
      const oneHourInMs = 60 * 60 * 1000;

      if (timeDiff < oneHourInMs) {
        return res.status(429).json({
          success: false,
          message: 'Too many OTP requests. Try again later.',
        });
      } else {
        // Reset attempts after 1 hour
        vendor.resetOTPAttempts = 0;
      }
    }

    // Send OTP via Twilio
    const otpResponse = await sendVendorResetOTPViaTwilio(phone);

    if (otpResponse.success) {
      // Update OTP attempt counter
      vendor.resetOTPAttempts += 1;
      vendor.resetOTPLastSent = new Date();
      await vendor.save();

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

// ============================================
// FORGOT PASSWORD - STEP 2: VERIFY OTP
// ============================================
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

    // Find vendor
    const vendor = await Vendor.findOne({ phone });
    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    // Verify OTP via Twilio
    const verifyResponse = await verifyVendorResetOTPViaTwilio(phone, otp);

    if (verifyResponse.success) {
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

// ============================================
// FORGOT PASSWORD - STEP 3: RESET PASSWORD
// ============================================
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

    // Find vendor
    const vendor = await Vendor.findOne({ phone });
    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update vendor password
    vendor.password = hashedPassword;
    vendor.resetOTPAttempts = 0;
    vendor.resetOTPLastSent = null;
    await vendor.save();

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

// ============================================
// GET VENDOR PROFILE
// ============================================
exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select('-password -resetOTPAttempts -resetOTPLastSent');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Get Vendor Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE VENDOR PROFILE
// ============================================
exports.updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const updateData = req.body;

    // Fields that vendor CANNOT update (only super admin can)
    const restrictedFields = [
      'email', 'commissionRate', 'status', 'createdBy', 
      'fssaiLicense', 'meatCategories', 'profileCompletionPercentage'
    ];

    // Remove restricted fields from update
    restrictedFields.forEach(field => delete updateData[field]);

    // Find and update vendor
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate profile completion percentage
    const completionPercentage = calculateProfileCompletion(vendor);
    vendor.profileCompletionPercentage = completionPercentage;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Update Vendor Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// CHANGE VENDOR PASSWORD
// ============================================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields required: oldPassword, newPassword, confirmPassword'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find vendor
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, vendor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Hash and update new password
    vendor.password = await bcrypt.hash(newPassword, 10);
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change Password Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// HELPER: Calculate Profile Completion
// ============================================
function calculateProfileCompletion(vendor) {
  let completion = 20; // Base 20% (created by super admin)

  // Business Details (10%)
  if (vendor.businessType && vendor.businessDescription) completion += 10;

  // Media (15%)
  if (vendor.logo && vendor.shopPhotos.length > 0) completion += 15;

  // Operations (15%)
  if (vendor.openingTime && vendor.closingTime && vendor.workingDays.length > 0) completion += 15;

  // Banking (20%)
  if (vendor.bankName && vendor.accountNumber && vendor.ifscCode) completion += 20;

  // Documents (20%)
  if (vendor.shopEstablishmentCertificate || vendor.tradeLicense) completion += 20;

  return Math.min(completion, 100);
}