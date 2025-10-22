// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');
// const { verifyToken, verifyAdmin  } = require('../middleware/authMiddleware');
// const { upload } = require('../middleware/uploadMiddleware');

// // Product CRUD
// router.post('/', verifyToken,verifyAdmin , upload.array('product_images', 10), productController.createProduct);
// router.get('/', verifyToken, productController.getAllProducts);
// router.get('/:id', verifyToken, productController.getProductById);
// router.put('/:id', verifyToken, productController.updateProduct);
// router.delete('/:id', verifyToken, productController.deleteProduct);

// // Variant Management
// router.post('/:product_id/variants', verifyToken, productController.addVariant);
// router.put('/variants/:variant_id', verifyToken, productController.updateVariant);
// router.delete('/variants/:variant_id', verifyToken, productController.deleteVariant);

// // Image Management
// router.post('/:product_id/images', verifyToken, VerifyAdmin,upload.array('images', 10), productController.addProductImages);
// router.put('/images/:image_id/set-primary', verifyToken, productController.setPrimaryImage);
// router.delete('/images/:image_id', verifyToken, productController.deleteProductImage);
// router.post('/images/reorder', verifyToken, productController.reorderImages);

// // Nutrition & Attributes
// router.put('/:product_id/nutrition', verifyToken, productController.updateNutrition);
// router.post('/:product_id/attributes', verifyToken, productController.addAttributes);
// router.put('/attributes/:attribute_id', verifyToken, productController.updateAttribute);
// router.delete('/attributes/:attribute_id', verifyToken, productController.deleteAttribute);

// // Bulk Operations
// router.post('/bulk-update-status', verifyToken, productController.bulkUpdateStatus);
// router.post('/bulk-delete', verifyToken, productController.bulkDeleteProducts);
// router.post('/bulk-price-update', verifyToken, productController.bulkPriceUpdate);

// module.exports = router;



const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyVendor } = require('../middleware/authMiddleware'); // ✅ CHANGED
const { upload } = require('../middleware/uploadMiddleware');

// ✅ CHANGED: verifyAdmin → verifyVendor
router.post('/', verifyToken, verifyVendor, upload.array('product_images', 10), productController.createProduct);
router.get('/', verifyToken, verifyVendor, productController.getAllProducts);
router.get('/:id', verifyToken, verifyVendor, productController.getProductById);
router.put('/:id', verifyToken, verifyVendor, productController.updateProduct);
router.delete('/:id', verifyToken, verifyVendor, productController.deleteProduct);

// Variant Management
router.post('/:product_id/variants', verifyToken, verifyVendor, productController.addVariant);
router.put('/variants/:variant_id', verifyToken, verifyVendor, productController.updateVariant);
router.delete('/variants/:variant_id', verifyToken, verifyVendor, productController.deleteVariant);

// Image Management
router.post('/:product_id/images', verifyToken, verifyVendor, upload.array('images', 10), productController.addProductImages);
router.put('/images/:image_id/set-primary', verifyToken, verifyVendor, productController.setPrimaryImage);
router.delete('/images/:image_id', verifyToken, verifyVendor, productController.deleteProductImage);
router.post('/images/reorder', verifyToken, verifyVendor, productController.reorderImages);

// Nutrition & Attributes
router.put('/:product_id/nutrition', verifyToken, verifyVendor, productController.updateNutrition);
router.post('/:product_id/attributes', verifyToken, verifyVendor, productController.addAttributes);
router.put('/attributes/:attribute_id', verifyToken, verifyVendor, productController.updateAttribute);
router.delete('/attributes/:attribute_id', verifyToken, verifyVendor, productController.deleteAttribute);

// Bulk Operations
router.post('/bulk-update-status', verifyToken, verifyVendor, productController.bulkUpdateStatus);
router.post('/bulk-delete', verifyToken, verifyVendor, productController.bulkDeleteProducts);
router.post('/bulk-price-update', verifyToken, verifyVendor, productController.bulkPriceUpdate);

module.exports = router;