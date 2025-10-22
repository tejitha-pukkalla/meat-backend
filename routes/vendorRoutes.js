const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const vendorProfileController = require('../controllers/vendorProfileController');
const shopDetailsController = require('../controllers/shopDetailsController');
const bankDetailsController = require('../controllers//bankDetailsController');
const { verifyToken, verifyVendor } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profilePhoto') {
      cb(null, 'uploads/vendor_photos/');
    } else if (file.fieldname === 'shopLogo') {
      cb(null, 'uploads/shop_logos/');
    } else if (file.fieldname === 'shopPhotos') {
      cb(null, 'uploads/shop_photos/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// ============================================
// PUBLIC ROUTES
// ============================================
router.post('/login', vendorController.loginVendor);
router.post('/send-reset-otp', vendorController.sendResetOTP);
router.post('/verify-reset-otp', vendorController.verifyResetOTP);
router.post('/reset-password', vendorController.resetPassword);

// ============================================
// PROTECTED ROUTES (Vendor Authentication Required)
// ============================================

// --- My Profile Routes ---
router.get('/my-profile', verifyToken, verifyVendor, vendorProfileController.getMyProfile);
router.put('/my-profile', verifyToken, verifyVendor, vendorProfileController.updateMyProfile);
router.post('/my-profile/photo', verifyToken, verifyVendor, upload.single('profilePhoto'), vendorProfileController.uploadProfilePhoto);

// --- Shop Details Routes ---
router.get('/shop-details', verifyToken, verifyVendor, shopDetailsController.getShopDetails);
router.put('/shop-details', verifyToken, verifyVendor, shopDetailsController.updateShopDetails);
router.post('/shop-details/location', verifyToken, verifyVendor, shopDetailsController.updateShopLocation);
router.post('/shop-details/logo', verifyToken, verifyVendor, upload.single('shopLogo'), shopDetailsController.uploadShopLogo);
router.post('/shop-details/photos', verifyToken, verifyVendor, upload.array('shopPhotos', 10), shopDetailsController.uploadShopPhotos);

// --- Bank Details Routes ---
router.get('/bank-details', verifyToken, verifyVendor, bankDetailsController.getBankDetails);
router.put('/bank-details', verifyToken, verifyVendor, bankDetailsController.updateBankDetails);

// --- Existing Routes ---
router.get('/profile', verifyToken, verifyVendor, vendorController.getVendorProfile);
router.put('/profile', verifyToken, verifyVendor, vendorController.updateVendorProfile);
router.put('/change-password', verifyToken, verifyVendor, vendorController.changePassword);

module.exports = router;