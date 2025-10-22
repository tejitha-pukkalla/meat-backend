const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


// Public Routes
router.post('/send-otp', userController.sendOTP);
router.post('/verify-otp', userController.verifyOTP);




module.exports = router;