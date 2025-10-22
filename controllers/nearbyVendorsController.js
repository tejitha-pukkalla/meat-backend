// const VendorProfile = require('../models/VendorProfile');
// const Vendor = require('../models/Vendor');

// // @desc    Get Nearby Vendors (Based on Customer Location)
// // @route   POST /api/customer/nearby-vendors
// // @access  Public or Private (Customer)
// exports.getNearbyVendors = async (req, res) => {
//   try {
//     const { latitude, longitude, radius = 10 } = req.body; // radius in km

//     // Validation
//     if (!latitude || !longitude) {
//       return res.status(400).json({
//         success: false,
//         message: 'Customer latitude and longitude are required'
//       });
//     }

//     if (latitude < -90 || latitude > 90) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid latitude value'
//       });
//     }

//     if (longitude < -180 || longitude > 180) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid longitude value'
//       });
//     }

//     // Get all vendor profiles with location
//     const vendorProfiles = await VendorProfile.find({
//       'shopLocation.latitude': { $exists: true, $ne: null },
//       'shopLocation.longitude': { $exists: true, $ne: null }
//     }).populate({
//       path: 'vendorId',
//       match: { 
//         status: 'active',
//         profileCompletionPercentage: { $gte: 80 } // Only show vendors with 80%+ profile completion
//       },
//       select: 'name email phone address city state pincode ' +
//               'logo businessType meatCategories halalCertified ' +
//               'openingTime closingTime deliveryAvailable ' +
//               'profileCompletionPercentage'
//     });

//     // Filter out null vendors (due to populate match filter)
//     const validVendors = vendorProfiles.filter(vp => vp.vendorId !== null);

//     // Calculate distance for each vendor
//     const vendorsWithDistance = validVendors.map(vendorProfile => {
//       const distance = calculateDistance(
//         latitude,
//         longitude,
//         vendorProfile.shopLocation.latitude,
//         vendorProfile.shopLocation.longitude
//       );

//       return {
//         vendorId: vendorProfile.vendorId._id,
//         name: vendorProfile.vendorId.name,
//         email: vendorProfile.vendorId.email,
//         phone: vendorProfile.vendorId.phone,
//         address: vendorProfile.vendorId.address,
//         city: vendorProfile.vendorId.city,
//         state: vendorProfile.vendorId.state,
//         pincode: vendorProfile.vendorId.pincode,
//         logo: vendorProfile.vendorId.logo,
//         businessType: vendorProfile.vendorId.businessType,
//         meatCategories: vendorProfile.vendorId.meatCategories,
//         halalCertified: vendorProfile.vendorId.halalCertified,
//         openingTime: vendorProfile.vendorId.openingTime,
//         closingTime: vendorProfile.vendorId.closingTime,
//         deliveryAvailable: vendorProfile.vendorId.deliveryAvailable,
//         profileCompletionPercentage: vendorProfile.vendorId.profileCompletionPercentage,
//         location: {
//           latitude: vendorProfile.shopLocation.latitude,
//           longitude: vendorProfile.shopLocation.longitude,
//           fullAddress: vendorProfile.shopLocation.fullAddress
//         },
//         distance: parseFloat(distance.toFixed(2)) // Distance in km
//       };
//     });

//     // Filter vendors within radius
//     const nearbyVendors = vendorsWithDistance.filter(vendor => vendor.distance <= radius);

//     // Sort by distance (nearest first)
//     nearbyVendors.sort((a, b) => a.distance - b.distance);

//     res.status(200).json({
//       success: true,
//       count: nearbyVendors.length,
//       customerLocation: {
//         latitude,
//         longitude
//       },
//       searchRadius: radius,
//       data: nearbyVendors
//     });

//   } catch (error) {
//     console.error('Get Nearby Vendors Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching nearby vendors',
//       error: error.message
//     });
//   }
// };

// // @desc    Get Vendor Details by ID
// // @route   GET /api/customer/vendor/:id
// // @access  Public
// exports.getVendorById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const vendor = await Vendor.findOne({
//       _id: id,
//       status: 'active'
//     }).select('-password -resetOTPAttempts -resetOTPLastSent');

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor not found or inactive'
//       });
//     }

//     const vendorProfile = await VendorProfile.findOne({ vendorId: id });

//     res.status(200).json({
//       success: true,
//       data: {
//         vendor,
//         profile: vendorProfile
//       }
//     });

//   } catch (error) {
//     console.error('Get Vendor By ID Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching vendor details',
//       error: error.message
//     });
//   }
// };

// // Helper function: Calculate distance using Haversine formula
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Earth's radius in kilometers

//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   const distance = R * c; // Distance in kilometers

//   return distance;
// }

// function toRadians(degrees) {
//   return degrees * (Math.PI / 180);
// }


const Vendor = require('../models/Vendor');

// @desc    Get Nearby Vendors (Based on Customer Location)
// @route   POST /api/customer/nearby-vendors
// @access  Public
exports.getNearbyVendors = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.body; // radius in km

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Customer latitude and longitude are required'
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // ✅ OPTIMIZED: Using MongoDB $geoNear aggregation (FASTEST METHOD)
    const nearbyVendors = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: 'distance',
          maxDistance: radius * 1000, // Convert km to meters
          spherical: true,
          query: {
            status: 'active',
            profileCompletionPercentage: { $gte: 80 },
            'shopLocation.coordinates': { $exists: true, $ne: [] }
          }
        }
      },
      {
        $project: {
          vendorId: '$_id',
          name: 1,
          email: 1,
          phone: 1,
          address: 1,
          city: 1,
          state: 1,
          pincode: 1,
          logo: 1,
          businessType: 1,
          meatCategories: 1,
          halalCertified: 1,
          jhatkaAvailable: 1,
          openingTime: 1,
          closingTime: 1,
          deliveryAvailable: 1,
          deliveryRadius: 1,
          profileCompletionPercentage: 1,
          specialization: 1,
          location: {
            latitude: { $arrayElemAt: ['$shopLocation.coordinates', 1] },
            longitude: { $arrayElemAt: ['$shopLocation.coordinates', 0] },
            fullAddress: '$address'
          },
          distance: {
            $round: [{ $divide: ['$distance', 1000] }, 2] // Convert to km with 2 decimals
          }
        }
      },
      { $sort: { distance: 1 } } // Nearest first
    ]);

    res.status(200).json({
      success: true,
      count: nearbyVendors.length,
      customerLocation: {
        latitude,
        longitude
      },
      searchRadius: radius,
      data: nearbyVendors
    });

  } catch (error) {
    console.error('Get Nearby Vendors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby vendors',
      error: error.message
    });
  }
};

// @desc    Get Vendor Details by ID
// @route   GET /api/customer/vendor/:id
// @access  Public
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findOne({
      _id: id,
      status: 'active'
    }).select('-password -resetOTPAttempts -resetOTPLastSent');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or inactive'
      });
    }

    // ✅ UPDATED: Extract location from GeoJSON
    const vendorData = {
      ...vendor.toObject(),
      location: vendor.shopLocation?.coordinates ? {
        latitude: vendor.shopLocation.coordinates[1],
        longitude: vendor.shopLocation.coordinates[0],
        fullAddress: vendor.address
      } : null
    };

    res.status(200).json({
      success: true,
      data: vendorData
    });

  } catch (error) {
    console.error('Get Vendor By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor details',
      error: error.message
    });
  }
};