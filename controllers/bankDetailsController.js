const Vendor = require('../models/Vendor');
const BankDetails = require('../models/BankDetails');
const { calculateProfileCompletion } = require('../utils/profileHelper');

// @desc    Get Bank Details
// @route   GET /api/vendor/bank-details
// @access  Private (Vendor only)
exports.getBankDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;

    let bankDetails = await BankDetails.findOne({ vendorId });

    // Return masked account number for security
    let responseData = null;
    if (bankDetails) {
      const decryptedAccount = bankDetails.getDecryptedAccountNumber();
      responseData = {
        ...bankDetails.toObject(),
        accountNumber: decryptedAccount ? '****' + decryptedAccount.slice(-4) : '',
        fullAccountNumber: null // Never send full number
      };
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get Bank Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank details',
      error: error.message
    });
  }
};

// @desc    Update Bank Details
// @route   PUT /api/vendor/bank-details
// @access  Private (Vendor only)
exports.updateBankDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
      upiId
    } = req.body;

    // Validation
    if (accountNumber && !/^[0-9]{9,18}$/.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Account number must be 9-18 digits'
      });
    }

    if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IFSC code format'
      });
    }

    // Find or create bank details
    let bankDetails = await BankDetails.findOne({ vendorId });

    if (bankDetails) {
      // Update existing
      if (accountHolderName !== undefined) bankDetails.accountHolderName = accountHolderName;
      if (bankName !== undefined) bankDetails.bankName = bankName;
      if (accountNumber !== undefined) bankDetails.accountNumber = accountNumber; // Will be encrypted
      if (ifscCode !== undefined) bankDetails.ifscCode = ifscCode.toUpperCase();
      if (branchName !== undefined) bankDetails.branchName = branchName;
      if (upiId !== undefined) bankDetails.upiId = upiId;
      
      await bankDetails.save();
    } else {
      // Create new
      bankDetails = await BankDetails.create({
        vendorId,
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode: ifscCode?.toUpperCase(),
        branchName,
        upiId
      });
    }

    // Check if bank details are complete
    const isComplete = !!(
      bankDetails.accountHolderName &&
      bankDetails.bankName &&
      bankDetails.accountNumber &&
      bankDetails.ifscCode
    );

    await Vendor.findByIdAndUpdate(vendorId, {
      isBankDetailsComplete: isComplete
    });

    // Recalculate profile completion
    await calculateProfileCompletion(vendorId);

    res.status(200).json({
      success: true,
      message: 'Bank details updated successfully',
      data: {
        accountHolderName: bankDetails.accountHolderName,
        bankName: bankDetails.bankName,
        ifscCode: bankDetails.ifscCode,
        branchName: bankDetails.branchName,
        upiId: bankDetails.upiId,
        isVerified: bankDetails.isVerified
      }
    });

  } catch (error) {
    console.error('Update Bank Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bank details',
      error: error.message
    });
  }
};