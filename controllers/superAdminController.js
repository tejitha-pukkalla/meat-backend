// const SuperAdmin = require('../models/SuperAdmin');
// const PlatformSettings = require('../models/PlatformSettings');
// const Vendor = require('../models/Vendor'); 
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');


// // Generate JWT Token
// const generateToken = (id, email) => {
//   return jwt.sign(
//     { 
//       id, 
//       email, 
//       role: 'super_admin' 
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRE || '7d' }
//   );
// };

// // @desc    Create Super Admin (One-time setup)
// // @route   POST /api/super-admin/setup
// // @access  Public (but checks if super admin exists)
// const createSuperAdmin = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     // Validation
//     if (!name || !email || !phone || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields: name, email, phone, password'
//       });
//     }

//     // Check if super admin already exists
//     const superAdminCount = await SuperAdmin.countDocuments();

//     if (superAdminCount > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Super Admin already exists. This setup endpoint is now disabled for security.'
//       });
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a valid email address'
//       });
//     }

//     // Phone validation (Indian format)
//     const phoneRegex = /^[6-9]\d{9}$/;
//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a valid 10-digit phone number'
//       });
//     }

//     // Password validation
//     if (password.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password must be at least 8 characters long'
//       });
//     }

//     // Create super admin (password will be auto-hashed by pre-save hook)
//     const superAdmin = await SuperAdmin.create({
//       name,
//       email,
//       phone,
//       password,
//       status: 'active'
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Super Admin created successfully! Please login to continue.',
//       data: {
//         id: superAdmin._id,
//         name: superAdmin.name,
//         email: superAdmin.email,
//         phone: superAdmin.phone,
//         status: superAdmin.status,
//         createdAt: superAdmin.createdAt
//       }
//     });

//   } catch (error) {
//     console.error('Create Super Admin Error:', error);
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({
//         success: false,
//         message: `${field} already exists`
//       });
//     }

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: messages[0]
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Server error while creating super admin',
//       error: error.message
//     });
//   }
// };

// // @desc    Super Admin Login
// // @route   POST /api/super-admin/login
// // @access  Public
// const loginSuperAdmin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and password'
//       });
//     }

//     // Find super admin by email (include password for verification)
//     const superAdmin = await SuperAdmin.findOne({ email }).select('+password');

//     if (!superAdmin) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     // Check if account is active
//     if (superAdmin.status !== 'active') {
//       return res.status(403).json({
//         success: false,
//         message: 'Your account has been deactivated. Contact support.'
//       });
//     }

//     // Verify password
//     const isPasswordValid = await superAdmin.comparePassword(password);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     // Update last login
//     superAdmin.lastLogin = new Date();
//     await superAdmin.save();

//     // Generate token
//     const token = generateToken(superAdmin._id, superAdmin.email);

//     // Remove password from response
//     const superAdminData = superAdmin.toJSON();

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       role: 'super_admin',
//       user: {
//         id: superAdminData._id,
//         name: superAdminData.name,
//         email: superAdminData.email,
//         phone: superAdminData.phone,
//         status: superAdminData.status,
//         lastLogin: superAdminData.lastLogin
//       }
//     });

//   } catch (error) {
//     console.error('Super Admin Login Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during login',
//       error: error.message
//     });
//   }
// };

// // @desc    Get Super Admin Profile
// // @route   GET /api/super-admin/profile
// // @access  Private (Super Admin only)
// const getSuperAdminProfile = async (req, res) => {
//   try {
//     const superAdmin = await SuperAdmin.findById(req.superAdmin.id).select('-password');

//     if (!superAdmin) {
//       return res.status(404).json({
//         success: false,
//         message: 'Super Admin not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: superAdmin
//     });

//   } catch (error) {
//     console.error('Get Profile Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Update Super Admin Profile
// // @route   PUT /api/super-admin/profile
// // @access  Private (Super Admin only)
// const updateSuperAdminProfile = async (req, res) => {
//   try {
//     const { name, phone } = req.body;
    
//     const superAdmin = await SuperAdmin.findById(req.superAdmin.id);

//     if (!superAdmin) {
//       return res.status(404).json({
//         success: false,
//         message: 'Super Admin not found'
//       });
//     }

//     // Update fields if provided
//     if (name) {
//       if (name.trim().length < 2) {
//         return res.status(400).json({
//           success: false,
//           message: 'Name must be at least 2 characters long'
//         });
//       }
//       superAdmin.name = name.trim();
//     }

//     if (phone) {
//       // Phone validation
//       const phoneRegex = /^[6-9]\d{9}$/;
//       if (!phoneRegex.test(phone)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Please provide a valid 10-digit phone number'
//         });
//       }

//       // Check if phone is already taken by another super admin
//       const existingPhone = await SuperAdmin.findOne({
//         phone,
//         _id: { $ne: req.superAdmin.id }
//       });

//       if (existingPhone) {
//         return res.status(400).json({
//           success: false,
//           message: 'Phone number already in use'
//         });
//       }

//       superAdmin.phone = phone;
//     }

//     await superAdmin.save();

//     res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       data: {
//         id: superAdmin._id,
//         name: superAdmin.name,
//         email: superAdmin.email,
//         phone: superAdmin.phone,
//         status: superAdmin.status
//       }
//     });

//   } catch (error) {
//     console.error('Update Profile Error:', error);
    
//     // Handle duplicate phone error
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number already in use'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Change Super Admin Password
// // @route   PUT /api/super-admin/change-password
// // @access  Private (Super Admin only)
// const changeSuperAdminPassword = async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;

//     // Validation
//     if (!oldPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide both old password and new password'
//       });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: 'New password must be at least 8 characters long'
//       });
//     }

//     if (oldPassword === newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'New password must be different from old password'
//       });
//     }

//     const superAdmin = await SuperAdmin.findById(req.superAdmin.id).select('+password');

//     if (!superAdmin) {
//       return res.status(404).json({
//         success: false,
//         message: 'Super Admin not found'
//       });
//     }

//     // Verify old password
//     const isOldPasswordValid = await superAdmin.comparePassword(oldPassword);

//     if (!isOldPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Old password is incorrect'
//       });
//     }

//     // Update password (will be auto-hashed by pre-save hook)
//     superAdmin.password = newPassword;
//     await superAdmin.save();

//     res.status(200).json({
//       success: true,
//       message: 'Password changed successfully. Please login again with new password.'
//     });

//   } catch (error) {
//     console.error('Change Password Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Get Platform Commission Settings
// // @route   GET /api/super-admin/commission-settings
// // @access  Private (Super Admin only)
// const getCommissionSettings = async (req, res) => {
//   try {
//     const settings = await PlatformSettings.find({
//       settingKey: {
//         $in: [
//           'platform_commission_per_order',
//           'delivery_partner_share',
//           'platform_profit_share'
//         ]
//       }
//     });

//     const formattedSettings = {};
//     settings.forEach(setting => {
//       formattedSettings[setting.settingKey] = {
//         value: setting.settingValue,
//         description: setting.description
//       };
//     });

//     res.status(200).json({
//       success: true,
//       data: formattedSettings,
//       summary: {
//         total_commission_per_order: '₹20',
//         delivery_partner_share: '₹10',
//         platform_profit_share: '₹10'
//       }
//     });

//   } catch (error) {
//     console.error('Get Commission Settings Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Update Platform Commission Settings
// // @route   PUT /api/super-admin/commission-settings
// // @access  Private (Super Admin only)
// const updateCommissionSettings = async (req, res) => {
//   try {
//     const { 
//       platform_commission_per_order, 
//       delivery_partner_share, 
//       platform_profit_share 
//     } = req.body;

//     // Validation
//     if (!platform_commission_per_order && !delivery_partner_share && !platform_profit_share) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide at least one setting to update'
//       });
//     }

//     // Update settings
//     const updatePromises = [];

//     if (platform_commission_per_order) {
//       updatePromises.push(
//         PlatformSettings.findOneAndUpdate(
//           { settingKey: 'platform_commission_per_order' },
//           { settingValue: platform_commission_per_order.toString() },
//           { new: true, upsert: true }
//         )
//       );
//     }

//     if (delivery_partner_share) {
//       updatePromises.push(
//         PlatformSettings.findOneAndUpdate(
//           { settingKey: 'delivery_partner_share' },
//           { settingValue: delivery_partner_share.toString() },
//           { new: true, upsert: true }
//         )
//       );
//     }

//     if (platform_profit_share) {
//       updatePromises.push(
//         PlatformSettings.findOneAndUpdate(
//           { settingKey: 'platform_profit_share' },
//           { settingValue: platform_profit_share.toString() },
//           { new: true, upsert: true }
//         )
//       );
//     }

//     await Promise.all(updatePromises);

//     res.status(200).json({
//       success: true,
//       message: 'Commission settings updated successfully'
//     });

//   } catch (error) {
//     console.error('Update Commission Settings Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };



// // Add this function to superAdminController.js

// // @desc    Create Vendor (By Super Admin)
// // @route   POST /api/super-admin/vendors
// // @access  Private (Super Admin only)
// const createVendor = async (req, res) => {
//   try {
//     const {
//       name, email, phone, password,
//       address, city, state, pincode,
//       fssaiLicense, meatCategories,
//       commissionRate
//     } = req.body;

//     // Validation
//     if (!name || !email || !phone || !password || !address || !city || !state || !pincode || !fssaiLicense || !meatCategories) {
//       return res.status(400).json({
//         success: false,
//         message: 'All required fields must be provided'
//       });
//     }

//     // Check if email exists
//     const existingEmail = await Vendor.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered'
//       });
//     }

//     // Check if phone exists
//     const existingPhone = await Vendor.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone already registered'
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//    // Create vendor
//     const vendor = await Vendor.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       address,
//       city,
//       state,
//       pincode,
//       fssaiLicense,
//       fssaiCertificate: req.file ? req.file.path : '', // If file uploaded
//       meatCategories: Array.isArray(meatCategories) ? meatCategories : [meatCategories],
//       commissionRate: commissionRate || 20,
//       status: 'pending',
//       createdBy: req.superAdmin.id, // ← THIS IS THE LINK!
//       profileCompletionPercentage: 20
//     });

//     // Send email to vendor with credentials (optional)
//     // await sendVendorWelcomeEmail(email, password);

//     return res.status(201).json({
//       success: true,
//       message: 'Vendor created successfully. Credentials sent to vendor email.',
//       data: {
//         id: vendor._id,
//         name: vendor.name,
//         email: vendor.email,
//         phone: vendor.phone,
//         status: vendor.status,
//         createdBy: req.superAdmin.name,
//         profileCompletionPercentage: vendor.profileCompletionPercentage
//       }
//     });

//   } catch (error) {
//     console.error('Create Vendor Error:', error);
    
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({
//         success: false,
//         message: `${field} already exists`
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Server error while creating vendor',
//       error: error.message
//     });
//   }
// };

// // @desc    Get All Vendors (By Super Admin)
// // @route   GET /api/super-admin/vendors
// // @access  Private (Super Admin only)
// const getAllVendors = async (req, res) => {
//   try {
//     const { status, search, page = 1, limit = 10 } = req.query;

//     // Build query
//     let query = {};

//     // Filter by status
//     if (status) {
//       query.status = status;
//     }

//     // Search by name, email, or phone
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Pagination
//     const skip = (page - 1) * limit;

//     // Get vendors
//     const vendors = await Vendor.find(query)
//       .select('-password')
//       .populate('createdBy', 'name email') // ← Show which super admin created them
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     // Get total count
//     const totalVendors = await Vendor.countDocuments(query);

//     return res.status(200).json({
//       success: true,
//       data: vendors,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalVendors / limit),
//         totalVendors,
//         vendorsPerPage: parseInt(limit)
//       }
//     });

//   } catch (error) {
//     console.error('Get All Vendors Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Get Single Vendor Details (By Super Admin)
// // @route   GET /api/super-admin/vendors/:id
// // @access  Private (Super Admin only)
// const getVendorById = async (req, res) => {
//   try {
//     const vendor = await Vendor.findById(req.params.id)
//       .select('-password')
//       .populate('createdBy', 'name email phone');

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: vendor
//     });

//   } catch (error) {
//     console.error('Get Vendor By ID Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Update Vendor (By Super Admin)
// // @route   PUT /api/super-admin/vendors/:id
// // @access  Private (Super Admin only)
// const updateVendor = async (req, res) => {
//   try {
//     const { status, commissionRate, ...otherUpdates } = req.body;

//     const updateData = { ...otherUpdates };

//     // Only super admin can update these fields
//     if (status) updateData.status = status;
//     if (commissionRate !== undefined) updateData.commissionRate = commissionRate;

//     const vendor = await Vendor.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Vendor updated successfully',
//       data: vendor
//     });

//   } catch (error) {
//     console.error('Update Vendor Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Activate/Deactivate Vendor (By Super Admin)
// // @route   PUT /api/super-admin/vendors/:id/status
// // @access  Private (Super Admin only)
// const updateVendorStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     if (!['active', 'inactive', 'pending', 'suspended'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status. Must be: active, inactive, pending, or suspended'
//       });
//     }

//     const vendor = await Vendor.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     ).select('name email phone status');

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: `Vendor status updated to ${status}`,
//       data: vendor
//     });

//   } catch (error) {
//     console.error('Update Vendor Status Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete Vendor (By Super Admin)
// // @route   DELETE /api/super-admin/vendors/:id
// // @access  Private (Super Admin only)
// const deleteVendor = async (req, res) => {
//   try {
//     const vendor = await Vendor.findByIdAndDelete(req.params.id);

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Vendor deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete Vendor Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Approve Vendor Documents (By Super Admin)
// // @route   PUT /api/super-admin/vendors/:id/approve-documents
// // @access  Private (Super Admin only)
// const approveVendorDocuments = async (req, res) => {
//   try {
//     const vendor = await Vendor.findByIdAndUpdate(
//       req.params.id,
//       { documentsVerified: true },
//       { new: true }
//     ).select('name email documentsVerified');

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Vendor documents approved successfully',
//       data: vendor
//     });

//   } catch (error) {
//     console.error('Approve Documents Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // @desc    Verify Vendor Banking Details (By Super Admin)
// // @route   PUT /api/super-admin/vendors/:id/verify-banking
// // @access  Private (Super Admin only)
// const verifyVendorBanking = async (req, res) => {
//   try {
//     const vendor = await Vendor.findByIdAndUpdate(
//       req.params.id,
//       { bankingVerified: true },
//       { new: true }
//     ).select('name email bankingVerified');

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Vendor banking details verified successfully',
//       data: vendor
//     });

//   } catch (error) {
//     console.error('Verify Banking Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   createSuperAdmin,
//   loginSuperAdmin,
//   getSuperAdminProfile,
//   updateSuperAdminProfile,
//   changeSuperAdminPassword,
//   getCommissionSettings,
//   updateCommissionSettings,
//   createVendor,
//   getAllVendors,
//   getVendorById,
//   updateVendor,
//   updateVendorStatus,
//   deleteVendor,
//   approveVendorDocuments,
//   verifyVendorBanking
// };




const SuperAdmin = require('../models/SuperAdmin');
const PlatformSettings = require('../models/PlatformSettings');
const Vendor = require('../models/Vendor'); 
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductImage = require('../models/ProductImage');
const { ProductNutrition } = require('../models/OtherModels');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// Generate JWT Token
const generateToken = (id, email) => {
  return jwt.sign(
    { 
      id, 
      email, 
      role: 'super_admin' 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Create Super Admin (One-time setup)
// @route   POST /api/super-admin/setup
// @access  Public (but checks if super admin exists)
const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, password'
      });
    }

    // Check if super admin already exists
    const superAdminCount = await SuperAdmin.countDocuments();

    if (superAdminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin already exists. This setup endpoint is now disabled for security.'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Create super admin (password will be auto-hashed by pre-save hook)
    const superAdmin = await SuperAdmin.create({
      name,
      email,
      phone,
      password,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Super Admin created successfully! Please login to continue.',
      data: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        phone: superAdmin.phone,
        status: superAdmin.status,
        createdAt: superAdmin.createdAt
      }
    });

  } catch (error) {
    console.error('Create Super Admin Error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating super admin',
      error: error.message
    });
  }
};

// @desc    Super Admin Login
// @route   POST /api/super-admin/login
// @access  Public
const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find super admin by email (include password for verification)
    const superAdmin = await SuperAdmin.findOne({ email }).select('+password');

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (superAdmin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await superAdmin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    // Generate token
    const token = generateToken(superAdmin._id, superAdmin.email);

    // Remove password from response
    const superAdminData = superAdmin.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: 'super_admin',
      user: {
        id: superAdminData._id,
        name: superAdminData.name,
        email: superAdminData.email,
        phone: superAdminData.phone,
        status: superAdminData.status,
        lastLogin: superAdminData.lastLogin
      }
    });

  } catch (error) {
    console.error('Super Admin Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get Super Admin Profile
// @route   GET /api/super-admin/profile
// @access  Private (Super Admin only)
const getSuperAdminProfile = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.superAdmin.id).select('-password');

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: superAdmin
    });

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update Super Admin Profile
// @route   PUT /api/super-admin/profile
// @access  Private (Super Admin only)
const updateSuperAdminProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const superAdmin = await SuperAdmin.findById(req.superAdmin.id);

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super Admin not found'
      });
    }

    // Update fields if provided
    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long'
        });
      }
      superAdmin.name = name.trim();
    }

    if (phone) {
      // Phone validation
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit phone number'
        });
      }

      // Check if phone is already taken by another super admin
      const existingPhone = await SuperAdmin.findOne({
        phone,
        _id: { $ne: req.superAdmin.id }
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }

      superAdmin.phone = phone;
    }

    await superAdmin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        phone: superAdmin.phone,
        status: superAdmin.status
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    
    // Handle duplicate phone error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already in use'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change Super Admin Password
// @route   PUT /api/super-admin/change-password
// @access  Private (Super Admin only)
const changeSuperAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both old password and new password'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from old password'
      });
    }

    const superAdmin = await SuperAdmin.findById(req.superAdmin.id).select('+password');

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super Admin not found'
      });
    }

    // Verify old password
    const isOldPasswordValid = await superAdmin.comparePassword(oldPassword);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Update password (will be auto-hashed by pre-save hook)
    superAdmin.password = newPassword;
    await superAdmin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again with new password.'
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get Platform Commission Settings
// @route   GET /api/super-admin/commission-settings
// @access  Private (Super Admin only)
const getCommissionSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.find({
      settingKey: {
        $in: [
          'platform_commission_per_order',
          'delivery_partner_share',
          'platform_profit_share'
        ]
      }
    });

    const formattedSettings = {};
    settings.forEach(setting => {
      formattedSettings[setting.settingKey] = {
        value: setting.settingValue,
        description: setting.description
      };
    });

    res.status(200).json({
      success: true,
      data: formattedSettings,
      summary: {
        total_commission_per_order: '₹20',
        delivery_partner_share: '₹10',
        platform_profit_share: '₹10'
      }
    });

  } catch (error) {
    console.error('Get Commission Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update Platform Commission Settings
// @route   PUT /api/super-admin/commission-settings
// @access  Private (Super Admin only)
const updateCommissionSettings = async (req, res) => {
  try {
    const { 
      platform_commission_per_order, 
      delivery_partner_share, 
      platform_profit_share 
    } = req.body;

    // Validation
    if (!platform_commission_per_order && !delivery_partner_share && !platform_profit_share) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one setting to update'
      });
    }

    // Update settings
    const updatePromises = [];

    if (platform_commission_per_order) {
      updatePromises.push(
        PlatformSettings.findOneAndUpdate(
          { settingKey: 'platform_commission_per_order' },
          { settingValue: platform_commission_per_order.toString() },
          { new: true, upsert: true }
        )
      );
    }

    if (delivery_partner_share) {
      updatePromises.push(
        PlatformSettings.findOneAndUpdate(
          { settingKey: 'delivery_partner_share' },
          { settingValue: delivery_partner_share.toString() },
          { new: true, upsert: true }
        )
      );
    }

    if (platform_profit_share) {
      updatePromises.push(
        PlatformSettings.findOneAndUpdate(
          { settingKey: 'platform_profit_share' },
          { settingValue: platform_profit_share.toString() },
          { new: true, upsert: true }
        )
      );
    }

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Commission settings updated successfully'
    });

  } catch (error) {
    console.error('Update Commission Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create Vendor (By Super Admin)
// @route   POST /api/super-admin/vendors
// @access  Private (Super Admin only)
const createVendor = async (req, res) => {
  try {
    const {
      name, email, phone, password,
      address, city, state, pincode,
      fssaiLicense, meatCategories,
      commissionRate
    } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !address || !city || !state || !pincode || !fssaiLicense || !meatCategories) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if email exists
    const existingEmail = await Vendor.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if phone exists
    const existingPhone = await Vendor.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

   // Create vendor
    const vendor = await Vendor.create({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      city,
      state,
      pincode,
      fssaiLicense,
      fssaiCertificate: req.file ? req.file.path : '',
      meatCategories: Array.isArray(meatCategories) ? meatCategories : [meatCategories],
      commissionRate: commissionRate || 20,
      status: 'pending',
      createdBy: req.superAdmin.id,
      profileCompletionPercentage: 20
    });

    return res.status(201).json({
      success: true,
      message: 'Vendor created successfully. Credentials sent to vendor email.',
      data: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        status: vendor.status,
        createdBy: req.superAdmin.name,
        profileCompletionPercentage: vendor.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Create Vendor Error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating vendor',
      error: error.message
    });
  }
};

// @desc    Get All Vendors (By Super Admin)
// @route   GET /api/super-admin/vendors
// @access  Private (Super Admin only)
const getAllVendors = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const vendors = await Vendor.find(query)
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalVendors = await Vendor.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: vendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVendors / limit),
        totalVendors,
        vendorsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get All Vendors Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get Single Vendor Details (By Super Admin)
// @route   GET /api/super-admin/vendors/:id
// @access  Private (Super Admin only)
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email phone');

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
    console.error('Get Vendor By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update Vendor (By Super Admin)
// @route   PUT /api/super-admin/vendors/:id
// @access  Private (Super Admin only)
const updateVendor = async (req, res) => {
  try {
    const { status, commissionRate, ...otherUpdates } = req.body;

    const updateData = { ...otherUpdates };

    if (status) updateData.status = status;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });

  } catch (error) {
    console.error('Update Vendor Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Activate/Deactivate Vendor (By Super Admin)
// @route   PUT /api/super-admin/vendors/:id/status
// @access  Private (Super Admin only)
const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, inactive, pending, or suspended'
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('name email phone status');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Vendor status updated to ${status}`,
      data: vendor
    });

  } catch (error) {
    console.error('Update Vendor Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete Vendor (By Super Admin)
// @route   DELETE /api/super-admin/vendors/:id
// @access  Private (Super Admin only)
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });

  } catch (error) {
    console.error('Delete Vendor Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve Vendor Documents (By Super Admin)
// @route   PUT /api/super-admin/vendors/:id/approve-documents
// @access  Private (Super Admin only)
const approveVendorDocuments = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { documentsVerified: true },
      { new: true }
    ).select('name email documentsVerified');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor documents approved successfully',
      data: vendor
    });

  } catch (error) {
    console.error('Approve Documents Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify Vendor Banking Details (By Super Admin)
// @route   PUT /api/super-admin/vendors/:id/verify-banking
// @access  Private (Super Admin only)
const verifyVendorBanking = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { bankingVerified: true },
      { new: true }
    ).select('name email bankingVerified');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor banking details verified successfully',
      data: vendor
    });

  } catch (error) {
    console.error('Verify Banking Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============================================
// PRODUCT MANAGEMENT FUNCTIONS
// ============================================

// @desc    Get All Products (Super Admin)
// @route   GET /api/super-admin/products
// @access  Private (Super Admin only)
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      vendor_id,
      category_id,
      subcategory_id,
      is_active,
      is_featured,
      is_bestseller,
      is_new_arrival,
      stock_status,
      min_price,
      max_price,
      min_rating,
      date_from,
      date_to,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    if (vendor_id) query.created_by = vendor_id;
    if (category_id) query.category_id = category_id;
    if (subcategory_id) query.subcategory_id = subcategory_id;
    if (is_active !== undefined) query.is_active = is_active === 'true';
    if (is_featured !== undefined) query.is_featured = is_featured === 'true';
    if (is_bestseller !== undefined) query.is_bestseller = is_bestseller === 'true';
    if (is_new_arrival !== undefined) query.is_new_arrival = is_new_arrival === 'true';

    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) query.createdAt.$gte = new Date(date_from);
      if (date_to) query.createdAt.$lte = new Date(date_to);
    }

    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

    let products = await Product.find(query)
      .populate('category_id', 'category_name')
      .populate('subcategory_id', 'subcategory_name')
      .populate('created_by', 'shopName email contactNumber')
      .populate('variants')
      .populate('images')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    if (min_price || max_price || stock_status || min_rating) {
      products = products.filter(product => {
        if (!product.variants || product.variants.length === 0) return false;

        if (min_price || max_price) {
          const hasVariantInRange = product.variants.some(v => {
            const price = v.selling_price;
            const minCheck = min_price ? price >= parseFloat(min_price) : true;
            const maxCheck = max_price ? price <= parseFloat(max_price) : true;
            return minCheck && maxCheck;
          });
          if (!hasVariantInRange) return false;
        }

        if (stock_status) {
          const hasMatchingStock = product.variants.some(v => {
            if (stock_status === 'out_of_stock') return v.stock_quantity === 0;
            if (stock_status === 'low_stock') 
              return v.stock_quantity > 0 && v.stock_quantity <= v.low_stock_threshold;
            if (stock_status === 'in_stock') 
              return v.stock_quantity > v.low_stock_threshold;
            return true;
          });
          if (!hasMatchingStock) return false;
        }

        if (min_rating) {
          const rating = product.rating || 0;
          if (rating < parseFloat(min_rating)) return false;
        }

        return true;
      });
    }

    products = products.map(product => ({
      ...product,
      primary_image: product.images?.find(img => img.is_primary)?.image_url || 
                     product.images?.[0]?.image_url,
      min_price: product.variants?.length > 0 
        ? Math.min(...product.variants.map(v => v.selling_price)) 
        : 0,
      max_price: product.variants?.length > 0 
        ? Math.max(...product.variants.map(v => v.selling_price)) 
        : 0,
      total_stock: product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0,
      rating: product.rating || 0,
      total_orders: product.total_orders || 0
    }));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// @desc    Get Single Product (Super Admin)
// @route   GET /api/super-admin/products/:id
// @access  Private (Super Admin only)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category_id')
      .populate('subcategory_id')
      .populate('variants')
      .populate('images')
      .populate('nutrition')
      .populate('created_by', 'shopName email contactNumber address')
      .populate('updated_by', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const productData = product.toObject();
    productData.min_price = product.variants?.length > 0 
      ? Math.min(...product.variants.map(v => v.selling_price)) 
      : 0;
    productData.max_price = product.variants?.length > 0 
      ? Math.max(...product.variants.map(v => v.selling_price)) 
      : 0;
    productData.total_stock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;
    productData.rating = product.rating || 0;
    productData.total_orders = product.total_orders || 0;
    productData.total_revenue = product.total_revenue || 0;

    res.status(200).json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// @desc    Update Product (Super Admin - Limited Fields)
// @route   PUT /api/super-admin/products/:id
// @access  Private (Super Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_name,
      short_description,
      long_description,
      is_featured,
      is_bestseller,
      is_new_arrival,
      is_active
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {};
    if (product_name !== undefined) updateData.product_name = product_name;
    if (short_description !== undefined) updateData.short_description = short_description;
    if (long_description !== undefined) updateData.long_description = long_description;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_bestseller !== undefined) updateData.is_bestseller = is_bestseller;
    if (is_new_arrival !== undefined) updateData.is_new_arrival = is_new_arrival;
    if (is_active !== undefined) updateData.is_active = is_active;

    updateData.updated_by = req.superAdmin.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('category_id')
      .populate('subcategory_id')
      .populate('variants')
      .populate('images');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// @desc    Toggle Product Status (Super Admin)
// @route   PATCH /api/super-admin/products/:id/toggle-status
// @access  Private (Super Admin only)
const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, reason } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.is_active = is_active;
    product.updated_by = req.superAdmin.id;

    if (!is_active && reason) {
      console.log(`Product ${id} deactivated by super admin. Reason: ${reason}`);
      // TODO: Send notification to vendor
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: product
    });

  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product status',
      error: error.message
    });
  }
};

// @desc    Feature Product (Super Admin)
// @route   PATCH /api/super-admin/products/:id/feature
// @access  Private (Super Admin only)
const featureProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.is_featured = is_featured;
    product.updated_by = req.superAdmin.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${is_featured ? 'featured' : 'unfeatured'} successfully`,
      data: product
    });

  } catch (error) {
    console.error('Feature product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to feature product',
      error: error.message
    });
  }
};

// @desc    Export Products to CSV (Super Admin)
// @route   GET /api/super-admin/products/export
// @access  Private (Super Admin only)
const exportProducts = async (req, res) => {
  try {
    const { search, vendor_id, category_id, is_active } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (vendor_id) query.created_by = vendor_id;
    if (category_id) query.category_id = category_id;
    if (is_active !== undefined) query.is_active = is_active === 'true';

    const products = await Product.find(query)
      .populate('category_id', 'category_name')
      .populate('created_by', 'shopName')
      .populate('variants')
      .lean();

    let csv = 'Product Name,SKU,Category,Vendor,Min Price,Max Price,Total Stock,Status\n';
    
    products.forEach(product => {
      const minPrice = product.variants?.length > 0 
        ? Math.min(...product.variants.map(v => v.selling_price)) 
        : 0;
      const maxPrice = product.variants?.length > 0 
        ? Math.max(...product.variants.map(v => v.selling_price)) 
        : 0;
      const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;

      csv += `"${product.product_name}","${product.sku}","${product.category_id?.category_name || ''}","${product.created_by?.shopName || ''}",${minPrice},${maxPrice},${totalStock},"${product.is_active ? 'Active' : 'Inactive'}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export products',
      error: error.message
    });
  }
};

// @desc    Get Product Analytics (Super Admin)
// @route   GET /api/super-admin/products/:id/analytics
// @access  Private (Super Admin only)
const getProductAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('variants');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const analytics = {
      total_orders: product.total_orders || 0,
      total_revenue: product.total_revenue || 0,
      avg_rating: product.rating || 0,
      total_reviews: product.total_reviews || 0,
      views: product.views || 0,
      conversion_rate: 0,
      pricing_history: [],
      stock_history: []
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// @desc    Get Low-Rated Products (Super Admin)
// @route   GET /api/super-admin/products/quality/low-rated
// @access  Private (Super Admin only)
const getLowRatedProducts = async (req, res) => {
  try {
    const { min_rating = 3, limit = 20 } = req.query;

    const products = await Product.find({
      rating: { $lt: parseFloat(min_rating), $gt: 0 }
    })
      .populate('category_id', 'category_name')
      .populate('created_by', 'shopName email')
      .populate('variants')
      .populate('images')
      .sort({ rating: 1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get low-rated products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low-rated products',
      error: error.message
    });
  }
};

// @desc    Get Products With Complaints (Super Admin)
// @route   GET /api/super-admin/products/quality/complaints
// @access  Private (Super Admin only)
const getProductsWithComplaints = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
      message: 'Complaint tracking coming soon'
    });

  } catch (error) {
    console.error('Get products with complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products with complaints',
      error: error.message
    });
  }
};

module.exports = {
  createSuperAdmin,
  loginSuperAdmin,
  getSuperAdminProfile,
  updateSuperAdminProfile,
  changeSuperAdminPassword,
  getCommissionSettings,
  updateCommissionSettings,
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
  approveVendorDocuments,
  verifyVendorBanking,
  // Product Management
  getAllProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  featureProduct,
  exportProducts,
  getProductAnalytics,
  getLowRatedProducts,
  getProductsWithComplaints
};