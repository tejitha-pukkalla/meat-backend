const Vendor = require('../models/Vendor');
const VendorProfile = require('../models/VendorProfile');
const BankDetails = require('../models/BankDetails');

// Calculate profile completion percentage
// exports.calculateProfileCompletion = async (vendorId) => {
//   try {
//     let completionPercentage = 20; // Base 20% (created by superadmin)

//     const vendor = await Vendor.findById(vendorId);
//     const vendorProfile = await VendorProfile.findOne({ vendorId });
//     const bankDetails = await BankDetails.findOne({ vendorId });

//     if (!vendor) return 20;

//     // 1. Personal Profile (15%)
//     if (vendorProfile) {
//       if (
//         vendorProfile.fullName &&
//         vendorProfile.dateOfBirth &&
//         vendorProfile.gender &&
//         vendorProfile.profilePhoto
//       ) {
//         completionPercentage += 15;
//       }
//     }

//     // 2. Shop Location (15%)
//     if (vendorProfile?.shopLocation) {
//       if (
//         vendorProfile.shopLocation.latitude &&
//         vendorProfile.shopLocation.longitude
//       ) {
//         completionPercentage += 15;
//       }
//     }

//     // 3. Shop Details (20%)
//     let shopScore = 0;
//     if (vendor.businessType && vendor.businessDescription) shopScore += 7;
//     if (vendor.openingTime && vendor.closingTime) shopScore += 7;
//     if (vendor.logo) shopScore += 6;
//     completionPercentage += shopScore;

//     // 4. Bank Details (20%)
//     if (bankDetails) {
//       if (
//         bankDetails.accountHolderName &&
//         bankDetails.accountNumber &&
//         bankDetails.ifscCode &&
//         bankDetails.bankName
//       ) {
//         completionPercentage += 20;
//       }
//     }

//     // 5. Documents (10%)
//     if (vendor.fssaiCertificate || vendor.shopEstablishmentCertificate) {
//       completionPercentage += 10;
//     }

//     // Update vendor with new percentage
//     vendor.profileCompletionPercentage = Math.min(completionPercentage, 100);
    
//     // Update status to active if 100% complete
//     if (completionPercentage === 100 && vendor.status === 'pending') {
//       vendor.status = 'active';
//     }
    
//     await vendor.save();

//     return completionPercentage;

//   } catch (error) {
//     console.error('Calculate Profile Completion Error:', error);
//     throw error;
//   }
// };
exports.calculateProfileCompletion = async (vendorId) => {
  try {
    let completionPercentage = 20; // Base 20%

    const vendor = await Vendor.findById(vendorId);
    const vendorProfile = await VendorProfile.findOne({ vendorId });
    const bankDetails = await BankDetails.findOne({ vendorId });

    if (!vendor) return 20;

    // 1. Personal Profile (15%)
    if (vendorProfile) {
      if (
        vendorProfile.fullName &&
        vendorProfile.dateOfBirth &&
        vendorProfile.gender &&
        vendorProfile.profilePhoto
      ) {
        completionPercentage += 15;
      }
    }

    // ✅ UPDATED: Check location from Vendor model (GeoJSON format)
    // 2. Shop Location (15%)
    if (vendor.shopLocation?.coordinates && 
        vendor.shopLocation.coordinates.length === 2) {
      completionPercentage += 15;
    }

    // 3. Shop Details (20%)
    let shopScore = 0;
    if (vendor.businessType && vendor.businessDescription) shopScore += 7;
    if (vendor.openingTime && vendor.closingTime) shopScore += 7;
    if (vendor.logo) shopScore += 6;
    completionPercentage += shopScore;

    // 4. Bank Details (20%)
    if (bankDetails) {
      if (
        bankDetails.accountHolderName &&
        bankDetails.accountNumber &&
        bankDetails.ifscCode &&
        bankDetails.bankName
      ) {
        completionPercentage += 20;
      }
    }

    // 5. Documents (10%)
    if (vendor.fssaiCertificate || vendor.shopEstablishmentCertificate) {
      completionPercentage += 10;
    }

    vendor.profileCompletionPercentage = Math.min(completionPercentage, 100);
    
    if (completionPercentage === 100 && vendor.status === 'pending') {
      vendor.status = 'active';
    }
    
    await vendor.save();
    return completionPercentage;

  } catch (error) {
    console.error('Calculate Profile Completion Error:', error);
    throw error;
  }
};