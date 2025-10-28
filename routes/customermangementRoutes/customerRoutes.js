const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customermanagementController/customerController');
const { verifyToken, checkSuperAdmin } = require('../../middleware/superAdminMiddleware'); // FIXED: Corrected path and imported functions

// Apply authentication middleware to all routes
router.use(verifyToken); // FIXED: Use verifyToken instead of authMiddleware
router.use(checkSuperAdmin); // FIXED: Use checkSuperAdmin instead of superAdminOnly

// Customer Management Routes
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/stats', customerController.getCustomerStats);
router.get('/customers/:id', customerController.getCustomerById);
router.get('/customers/:id/profile', customerController.getCustomerProfile);
router.get('/customers/:id/activity', customerController.getCustomerActivity);
router.put('/customers/:id', customerController.updateCustomer);
router.patch('/customers/:id/block', customerController.blockCustomer);
router.patch('/customers/:id/unblock', customerController.unblockCustomer);

module.exports = router;