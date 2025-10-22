const Vendor = require('../models/Vendor');
const VendorProfile = require('../models/VendorProfile');
const { calculateProfileCompletion } = require('../utils/profileHelper');

// @desc    Get Vendor Personal Profile
// @route   GET /api/vendor/my-profile
// @access  Private (Vendor only)
exports.getMyProfile = async (req, res) => {
  try {
    const vendorId = req.user.id; // From auth middleware

    // Get vendor basic info
    const vendor = await Vendor.findById(vendorId).select('-password');
    
    // Get vendor profile details
    let vendorProfile = await VendorProfile.findOne({ vendorId });
    
    // If profile doesn't exist, create empty one
    if (!vendorProfile) {
      vendorProfile = await VendorProfile.create({ vendorId });
    }

    res.status(200).json({
      success: true,
      data: {
        vendor,
        profile: vendorProfile
      }
    });

  } catch (error) {
    console.error('Get My Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update Vendor Personal Profile
// @route   PUT /api/vendor/my-profile
// @access  Private (Vendor only)
exports.updateMyProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      fullName,
      dateOfBirth,
      gender,
      emergencyContact,
      yearsInBusiness
    } = req.body;

    // Find or create vendor profile
    let vendorProfile = await VendorProfile.findOne({ vendorId });
    
    if (!vendorProfile) {
      vendorProfile = new VendorProfile({ vendorId });
    }

    // Update fields
    if (fullName) vendorProfile.fullName = fullName;
    if (dateOfBirth) vendorProfile.dateOfBirth = dateOfBirth;
    if (gender) vendorProfile.gender = gender;
    if (emergencyContact) vendorProfile.emergencyContact = emergencyContact;
    if (yearsInBusiness !== undefined) vendorProfile.yearsInBusiness = yearsInBusiness;

    await vendorProfile.save();

    // Check if personal profile is complete
    const isComplete = !!(
      vendorProfile.fullName &&
      vendorProfile.dateOfBirth &&
      vendorProfile.gender &&
      vendorProfile.profilePhoto
    );

    // Update vendor
    await Vendor.findByIdAndUpdate(vendorId, {
      isPersonalProfileComplete: isComplete
    });

    // Recalculate profile completion
    await calculateProfileCompletion(vendorId);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: vendorProfile
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Upload Profile Photo
// @route   POST /api/vendor/my-profile/photo
// @access  Private (Vendor only)
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const vendorId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = `/uploads/vendor_photos/${req.file.filename}`;

    // Update vendor profile
    let vendorProfile = await VendorProfile.findOne({ vendorId });
    
    if (!vendorProfile) {
      vendorProfile = await VendorProfile.create({ vendorId });
    }

    vendorProfile.profilePhoto = filePath;
    await vendorProfile.save();

    // Recalculate completion
    await calculateProfileCompletion(vendorId);

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePhoto: filePath
      }
    });

  } catch (error) {
    console.error('Upload Photo Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo',
      error: error.message
    });
  }
};