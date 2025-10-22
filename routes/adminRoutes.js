
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// PUBLIC ROUTES
router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/send-reset-otp', adminController.sendResetOTP);
router.post('/verify-reset-otp', adminController.verifyResetOTP);
router.post('/reset-password', adminController.resetPassword);

// PROTECTED ROUTES (Example - can add more admin-specific routes here)
// router.get('/profile', verifyToken, verifyAdmin, authMiddleware.getAdminProfile);

module.exports = router;
