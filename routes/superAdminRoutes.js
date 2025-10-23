const express = require('express');
const router = express.Router();

const {createSuperAdmin,loginSuperAdmin,getSuperAdminProfile,updateSuperAdminProfile,changeSuperAdminPassword,getCommissionSettings,updateCommissionSettings,
    createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
  approveVendorDocuments,
  verifyVendorBanking
} = require('../controllers/superAdminController');

const {verifyToken, checkSuperAdmin} = require('../middleware/superAdminMiddleware');

// @desc    Create first super admin (one-time use)
router.post('/setup', createSuperAdmin);


router.post('/login', loginSuperAdmin);


// Profile Management
router.get('/profile', verifyToken, checkSuperAdmin, getSuperAdminProfile);
router.put('/profile', verifyToken, checkSuperAdmin, updateSuperAdminProfile);
router.put('/change-password', verifyToken, checkSuperAdmin, changeSuperAdminPassword);

// Platform Commission Settings
router.get('/commission-settings', verifyToken, checkSuperAdmin, getCommissionSettings);
router.put('/commission-settings', verifyToken, checkSuperAdmin, updateCommissionSettings);

// ============================================
// VENDOR MANAGEMENT (NEW ROUTES)
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


module.exports = router;