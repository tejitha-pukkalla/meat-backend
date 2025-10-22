const express = require('express');
const router = express.Router();
const profileController = require('../controllers/userProfileController');
const { verifyToken, verifyUser } = require('../middleware/authMiddleware');
 
// All routes require authentication
router.use(verifyToken);
router.use(verifyUser);
 
// Profile Routes
router.get('/profile', profileController.getProfile);
router.post('/profile', profileController.updateProfile);
router.put('/profile', profileController.updateProfile);
 
// Address Routes
router.post('/address', profileController.addAddress);
router.get('/addresses', profileController.getAddresses);
router.put('/address/:addressId', profileController.updateAddress);
router.delete('/address/:addressId', profileController.deleteAddress);
router.patch('/address/:addressId/set-default', profileController.setDefaultAddress);
 
module.exports = router;