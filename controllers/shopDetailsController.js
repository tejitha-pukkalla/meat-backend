const Vendor = require('../models/Vendor');
const VendorProfile = require('../models/VendorProfile');
const { calculateProfileCompletion } = require('../utils/profileHelper');

exports.getShopDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await Vendor.findById(vendorId).select(
      'name address city state pincode landmark googleMapsLocation ' +
      'openingTime closingTime workingDays weeklyOff alternatePhone ' +
      'businessType businessDescription specialization logo shopPhotos coverImage ' +
      'deliveryAvailable deliveryRadius deliveryCharges minimumOrderValue ' +
      'halalCertified jhatkaAvailable coldStorageAvailable customCuttingService marinationService ' +
      'shopLocation' // ✅ ADDED: Include shopLocation
    );

    // ✅ UPDATED: Extract location from GeoJSON format
    const locationData = vendor.shopLocation?.coordinates 
      ? {
          latitude: vendor.shopLocation.coordinates[1],  // coordinates[1] = latitude
          longitude: vendor.shopLocation.coordinates[0], // coordinates[0] = longitude
          fullAddress: vendor.address
        }
      : null;

    res.status(200).json({
      success: true,
      data: {
        vendor,
        location: locationData
      }
    });

  } catch (error) {
    console.error('Get Shop Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop details',
      error: error.message
    });
  }
};


// @desc    Update Shop Details
// @route   PUT /api/vendor/shop-details
// @access  Private (Vendor only)
exports.updateShopDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      // Basic info
      landmark,
      googleMapsLocation,
      alternatePhone,
      
      // Business info
      businessType,
      businessDescription,
      specialization,
      
      // Operations
      openingTime,
      closingTime,
      workingDays,
      weeklyOff,
      
      // Services
      deliveryAvailable,
      deliveryRadius,
      deliveryCharges,
      minimumOrderValue,
      coldStorageAvailable,
      customCuttingService,
      marinationService,
      
      // Certifications
      halalCertified,
      jhatkaAvailable
    } = req.body;

    const updateData = {};
    
    // Add fields to update if provided
    if (landmark !== undefined) updateData.landmark = landmark;
    if (googleMapsLocation !== undefined) updateData.googleMapsLocation = googleMapsLocation;
    if (alternatePhone !== undefined) updateData.alternatePhone = alternatePhone;
    if (businessType !== undefined) updateData.businessType = businessType;
    if (businessDescription !== undefined) updateData.businessDescription = businessDescription;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (openingTime !== undefined) updateData.openingTime = openingTime;
    if (closingTime !== undefined) updateData.closingTime = closingTime;
    if (workingDays !== undefined) updateData.workingDays = workingDays;
    if (weeklyOff !== undefined) updateData.weeklyOff = weeklyOff;
    if (deliveryAvailable !== undefined) updateData.deliveryAvailable = deliveryAvailable;
    if (deliveryRadius !== undefined) updateData.deliveryRadius = deliveryRadius;
    if (deliveryCharges !== undefined) updateData.deliveryCharges = deliveryCharges;
    if (minimumOrderValue !== undefined) updateData.minimumOrderValue = minimumOrderValue;
    if (coldStorageAvailable !== undefined) updateData.coldStorageAvailable = coldStorageAvailable;
    if (customCuttingService !== undefined) updateData.customCuttingService = customCuttingService;
    if (marinationService !== undefined) updateData.marinationService = marinationService;
    if (halalCertified !== undefined) updateData.halalCertified = halalCertified;
    if (jhatkaAvailable !== undefined) updateData.jhatkaAvailable = jhatkaAvailable;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Check if shop details are complete
    const isComplete = !!(
      vendor.businessType &&
      vendor.openingTime &&
      vendor.closingTime &&
      vendor.workingDays && vendor.workingDays.length > 0
    );

    await Vendor.findByIdAndUpdate(vendorId, {
      isShopDetailsComplete: isComplete
    });

    // Recalculate profile completion
    await calculateProfileCompletion(vendorId);

    res.status(200).json({
      success: true,
      message: 'Shop details updated successfully',
      data: vendor
    });

  } catch (error) {
    console.error('Update Shop Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shop details',
      error: error.message
    });
  }
};

exports.updateShopLocation = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { latitude, longitude, fullAddress } = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude value'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude value'
      });
    }

    // ✅ UPDATED: Save location directly in Vendor model (GeoJSON format)
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        shopLocation: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
        },
        address: fullAddress || vendor.address
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Recalculate profile completion
    await calculateProfileCompletion(vendorId);

    res.status(200).json({
      success: true,
      message: 'Shop location updated successfully',
      data: {
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          fullAddress: fullAddress || vendor.address
        }
      }
    });

  } catch (error) {
    console.error('Update Location Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
};
// @desc    Upload Shop Logo
// @route   POST /api/vendor/shop-details/logo
// @access  Private (Vendor only)
exports.uploadShopLogo = async (req, res) => {
  try {
    const vendorId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = `/uploads/shop_logos/${req.file.filename}`;

    await Vendor.findByIdAndUpdate(vendorId, {
      logo: filePath
    });

    // Recalculate completion
    await calculateProfileCompletion(vendorId);

    res.status(200).json({
      success: true,
      message: 'Shop logo uploaded successfully',
      data: {
        logo: filePath
      }
    });

  } catch (error) {
    console.error('Upload Logo Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading logo',
      error: error.message
    });
  }
};

// @desc    Upload Shop Photos
// @route   POST /api/vendor/shop-details/photos
// @access  Private (Vendor only)
exports.uploadShopPhotos = async (req, res) => {
  try {
    const vendorId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const filePaths = req.files.map(file => `/uploads/shop_photos/${file.filename}`);

    const vendor = await Vendor.findById(vendorId);
    vendor.shopPhotos = [...vendor.shopPhotos, ...filePaths];
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Shop photos uploaded successfully',
      data: {
        shopPhotos: vendor.shopPhotos
      }
    });

  } catch (error) {
    console.error('Upload Photos Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photos',
      error: error.message
    });
  }
};