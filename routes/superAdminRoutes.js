// const express = require('express');
// const router = express.Router();

// const {createSuperAdmin,loginSuperAdmin,getSuperAdminProfile,updateSuperAdminProfile,changeSuperAdminPassword,getCommissionSettings,updateCommissionSettings,
//     createVendor,
//   getAllVendors,
//   getVendorById,
//   updateVendor,
//   updateVendorStatus,
//   deleteVendor,
//   approveVendorDocuments,
//   verifyVendorBanking
// } = require('../controllers/superAdminController');

// const {verifyToken, checkSuperAdmin} = require('../middleware/superAdminMiddleware');

// // @desc    Create first super admin (one-time use)
// router.post('/setup', createSuperAdmin);


// router.post('/login', loginSuperAdmin);


// // Profile Management
// router.get('/profile', verifyToken, checkSuperAdmin, getSuperAdminProfile);
// router.put('/profile', verifyToken, checkSuperAdmin, updateSuperAdminProfile);
// router.put('/change-password', verifyToken, checkSuperAdmin, changeSuperAdminPassword);

// // Platform Commission Settings
// router.get('/commission-settings', verifyToken, checkSuperAdmin, getCommissionSettings);
// router.put('/commission-settings', verifyToken, checkSuperAdmin, updateCommissionSettings);

// // ============================================
// // VENDOR MANAGEMENT (NEW ROUTES)
// // ============================================

// // Create and List Vendors
// router.post('/vendors', verifyToken, checkSuperAdmin, createVendor);
// router.get('/vendors', verifyToken, checkSuperAdmin, getAllVendors);

// // Single Vendor Operations
// router.get('/vendors/:id', verifyToken, checkSuperAdmin, getVendorById);
// router.put('/vendors/:id', verifyToken, checkSuperAdmin, updateVendor);
// router.delete('/vendors/:id', verifyToken, checkSuperAdmin, deleteVendor);

// // Vendor Status & Approval
// router.put('/vendors/:id/status', verifyToken, checkSuperAdmin, updateVendorStatus);
// router.put('/vendors/:id/approve-documents', verifyToken, checkSuperAdmin, approveVendorDocuments);
// router.put('/vendors/:id/verify-banking', verifyToken, checkSuperAdmin, verifyVendorBanking);


// module.exports = router;




const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/superAdminController');

const { verifyToken, checkSuperAdmin } = require('../middleware/superAdminMiddleware');

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// @desc    Create first super admin (one-time use)
router.post('/setup', createSuperAdmin);

// @desc    Super admin login
router.post('/login', loginSuperAdmin);

// ============================================
// PROFILE MANAGEMENT ROUTES
// ============================================

router.get('/profile', verifyToken, checkSuperAdmin, getSuperAdminProfile);
router.put('/profile', verifyToken, checkSuperAdmin, updateSuperAdminProfile);
router.put('/change-password', verifyToken, checkSuperAdmin, changeSuperAdminPassword);

// ============================================
// PLATFORM COMMISSION SETTINGS
// ============================================

router.get('/commission-settings', verifyToken, checkSuperAdmin, getCommissionSettings);
router.put('/commission-settings', verifyToken, checkSuperAdmin, updateCommissionSettings);

// ============================================
// VENDOR MANAGEMENT ROUTES
// ============================================

// Create and List Vendors
router.post('/vendors', verifyToken, checkSuperAdmin, createVendor);
router.get('/vendors', verifyToken, checkSuperAdmin, getAllVendors);

// Single Vendor Operations
router.get('/vendors/:id', verifyToken, checkSuperAdmin, getVendorById);
router.put('/vendors/:id', verifyToken, checkSuperAdmin, updateVendor);
router.delete('/vendors/:id', verifyToken, checkSuperAdmin, deleteVendor);

// Vendor Status & Approval
router.put('/vendors/:id/status', verifyToken, checkSuperAdmin, updateVendorStatus);
router.put('/vendors/:id/approve-documents', verifyToken, checkSuperAdmin, approveVendorDocuments);
router.put('/vendors/:id/verify-banking', verifyToken, checkSuperAdmin, verifyVendorBanking);

// ============================================
// PRODUCT MANAGEMENT ROUTES
// ============================================

// Export products (must be before /:id routes)
router.get('/products/export', verifyToken, checkSuperAdmin, exportProducts);

// Quality monitoring routes
router.get('/products/quality/low-rated', verifyToken, checkSuperAdmin, getLowRatedProducts);
router.get('/products/quality/complaints', verifyToken, checkSuperAdmin, getProductsWithComplaints);

// Get all products with filters
router.get('/products', verifyToken, checkSuperAdmin, getAllProducts);

// Single product operations
router.get('/products/:id', verifyToken, checkSuperAdmin, getProductById);
router.put('/products/:id', verifyToken, checkSuperAdmin, updateProduct);

// Product status management
router.patch('/products/:id/toggle-status', verifyToken, checkSuperAdmin, toggleProductStatus);
router.patch('/products/:id/feature', verifyToken, checkSuperAdmin, featureProduct);

// Product analytics
router.get('/products/:id/analytics', verifyToken, checkSuperAdmin, getProductAnalytics);

module.exports = router;