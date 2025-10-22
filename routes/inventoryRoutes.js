// const express = require('express');
// const router = express.Router();
// const inventoryController = require('../controllers/inventoryController');
// const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// // ✅ Protect all routes: first verify token, then check admin role
// router.put('/update-stock/:variant_id', verifyToken, verifyAdmin, inventoryController.updateStock);
// router.get('/low-stock', verifyToken, verifyAdmin, inventoryController.getLowStockProducts);
// router.get('/out-of-stock', verifyToken, verifyAdmin, inventoryController.getOutOfStockProducts);
// router.get('/expiring', verifyToken, verifyAdmin, inventoryController.getExpiringProducts);
// router.get('/history/:variant_id', verifyToken, verifyAdmin, inventoryController.getInventoryHistory);
// router.post('/bulk-update', verifyToken, verifyAdmin, inventoryController.bulkStockUpdate);
// router.get('/summary', verifyToken, verifyAdmin, inventoryController.getInventorySummary);

// module.exports = router;


const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, verifyVendor } = require('../middleware/authMiddleware'); // ✅ CHANGED

// ✅ CHANGED: verifyAdmin → verifyVendor
router.put('/update-stock/:variant_id', verifyToken, verifyVendor, inventoryController.updateStock);
router.get('/low-stock', verifyToken, verifyVendor, inventoryController.getLowStockProducts);
router.get('/out-of-stock', verifyToken, verifyVendor, inventoryController.getOutOfStockProducts);
router.get('/expiring', verifyToken, verifyVendor, inventoryController.getExpiringProducts);
router.get('/history/:variant_id', verifyToken, verifyVendor, inventoryController.getInventoryHistory);
router.post('/bulk-update', verifyToken, verifyVendor, inventoryController.bulkStockUpdate);
router.get('/summary', verifyToken, verifyVendor, inventoryController.getInventorySummary);

module.exports = router;