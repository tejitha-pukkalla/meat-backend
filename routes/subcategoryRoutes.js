

// const express = require('express');
// const router = express.Router();
// const subcategoryController = require('../controllers/subcategoryController');
// const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
// const { upload } = require('../middleware/uploadMiddleware');




// router.post('/bulk-update-status', verifyToken, verifyAdmin, subcategoryController.bulkUpdateStatus);
// // Admin-only routes
// router.post('/', verifyToken, verifyAdmin, upload.single('subcategory_image'), subcategoryController.createSubcategory);
// router.get('/', verifyToken, verifyAdmin, subcategoryController.getAllSubcategories);
// router.get('/:id', verifyToken, verifyAdmin, subcategoryController.getSubcategoryById);
// router.put('/:id', verifyToken, verifyAdmin, upload.single('subcategory_image'), subcategoryController.updateSubcategory);
// router.delete('/:id', verifyToken, verifyAdmin, subcategoryController.deleteSubcategory);



// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const subcategoryController = require('../controllers/subcategoryController');
// const { verifyToken, verifyVendor } = require('../middleware/authMiddleware'); // ✅ CHANGED
// const { upload } = require('../middleware/uploadMiddleware');

// // ✅ CHANGED: verifyAdmin → verifyVendor
// router.post('/bulk-update-status', verifyToken, verifyVendor, subcategoryController.bulkUpdateStatus);
// router.post('/', verifyToken, verifyVendor, upload.single('subcategory_image'), subcategoryController.createSubcategory);
// router.get('/', verifyToken, verifyVendor, subcategoryController.getAllSubcategories);
// router.get('/:id', verifyToken, verifyVendor, subcategoryController.getSubcategoryById);
// router.put('/:id', verifyToken, verifyVendor, upload.single('subcategory_image'), subcategoryController.updateSubcategory);
// router.delete('/:id', verifyToken, verifyVendor, subcategoryController.deleteSubcategory);

// module.exports = router;

// vendor to admin

const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const { verifyToken, checkSuperAdmin } = require('../middleware/superAdminMiddleware'); // ✅ CHANGED
const { upload } = require('../middleware/uploadMiddleware');

// ✅ CHANGED: All routes now use SuperAdmin middleware
router.post('/bulk-update-status', verifyToken, checkSuperAdmin, subcategoryController.bulkUpdateStatus);
router.post('/', verifyToken, checkSuperAdmin, upload.single('subcategory_image'), subcategoryController.createSubcategory);
router.get('/', verifyToken, checkSuperAdmin, subcategoryController.getAllSubcategories);
router.get('/:id', verifyToken, checkSuperAdmin, subcategoryController.getSubcategoryById);
router.put('/:id', verifyToken, checkSuperAdmin, upload.single('subcategory_image'), subcategoryController.updateSubcategory);
router.delete('/:id', verifyToken, checkSuperAdmin, subcategoryController.deleteSubcategory);

module.exports = router;