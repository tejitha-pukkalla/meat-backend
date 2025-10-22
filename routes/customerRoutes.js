const express = require('express');
const router = express.Router();
const nearbyVendorsController = require('../controllers/nearbyVendorsController');

// @route   POST /api/customer/nearby-vendors
// @desc    Get nearby vendors based on customer location
// @access  Public
router.post('/nearby-vendors', nearbyVendorsController.getNearbyVendors);

// @route   GET /api/customer/vendor/:id
// @desc    Get specific vendor details
// @access  Public
router.get('/vendor/:id', nearbyVendorsController.getVendorById);

module.exports = router;