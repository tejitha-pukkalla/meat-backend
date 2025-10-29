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


// const express = require('express');
// const router = express.Router();
// const inventoryController = require('../controllers/inventoryController');
// const { verifyToken, verifyVendor } = require('../middleware/authMiddleware'); // ✅ CHANGED

// // ✅ CHANGED: verifyAdmin → verifyVendor
// router.put('/update-stock/:variant_id', verifyToken, verifyVendor, inventoryController.updateStock);
// router.get('/low-stock', verifyToken, verifyVendor, inventoryController.getLowStockProducts);
// router.get('/out-of-stock', verifyToken, verifyVendor, inventoryController.getOutOfStockProducts);
// router.get('/expiring', verifyToken, verifyVendor, inventoryController.getExpiringProducts);
// router.get('/history/:variant_id', verifyToken, verifyVendor, inventoryController.getInventoryHistory);
// router.post('/bulk-update', verifyToken, verifyVendor, inventoryController.bulkStockUpdate);
// router.get('/summary', verifyToken, verifyVendor, inventoryController.getInventorySummary);

// module.exports = router;


const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, verifyVendor } = require('../middleware/authMiddleware');

// ============= DASHBOARD & OVERVIEW =============
// GET /api/inventory/dashboard - Stock overview dashboard
router.get('/dashboard', 
  verifyToken, 
  verifyVendor, 
  inventoryController.getStockDashboard
);

// GET /api/inventory/summary - Inventory summary (original)
router.get('/summary', 
  verifyToken, 
  verifyVendor, 
  inventoryController.getInventorySummary
);

// ============= STOCK MANAGEMENT =============
// GET /api/inventory/products - Get all products with stock details
router.get('/products', 
  verifyToken, 
  verifyVendor, 
  inventoryController.getAllProductsStock
);

// PUT /api/inventory/update-stock/:variant_id - Update single product stock
router.put('/update-stock/:variant_id', 
  verifyToken, 
  verifyVendor, 
  inventoryController.updateStock
);

// POST /api/inventory/bulk-update - Bulk stock update
router.post('/bulk-update', 
  verifyToken, 
  verifyVendor, 
  inventoryController.bulkStockUpdate
);

// ============= STOCK ALERTS =============
// GET /api/inventory/low-stock - Get low stock products
router.get('/low-stock', 
  verifyToken, 
  verifyVendor, 
  inventoryController.getLowStockProducts
);

// GET /api/inventory/out-of-stock - Get out of stock products
router.get('/out-of-stock', 
  verifyToken, 
  verifyVendor, 
  inventoryController.getOutOfStockProducts
);

// GET /api/inventory/expiring - Get products nearing expiry
router.get('/expiring', 
  verifyToken, 
  verifyVendor, 
  inventoryController.getExpiringProducts
);

// ============= HISTORY =============
// GET /api/inventory/history/:variant_id - Get inventory history for specific variant
router.get('/history/:variant_id', 
  verifyToken, 
  verifyVendor, 
  inventoryController.getInventoryHistory
);

module.exports = router;