// const express = require('express');
// const router = express.Router();
// const categoryController = require('../controllers/categoryController');
// const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
// const { upload } = require('../middleware/uploadMiddleware');




// router.post('/bulk-update-status', verifyToken, verifyAdmin, categoryController.bulkUpdateStatus);
// router.post('/reorder', verifyToken, verifyAdmin, categoryController.reorderCategories);
// // ✅ First verify token, then check admin role
// router.post('/', verifyToken, verifyAdmin, upload.single('category_image'), categoryController.createCategory);
// router.get('/', verifyToken, verifyAdmin, categoryController.getAllCategories);
// router.get('/:id', verifyToken, verifyAdmin, categoryController.getCategoryById);
// router.put('/:id', verifyToken, verifyAdmin, upload.single('category_image'), categoryController.updateCategory);
// router.delete('/:id', verifyToken, verifyAdmin, categoryController.deleteCategory);

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const categoryController = require('../controllers/categoryController');
// const { verifyToken, verifyVendor } = require('../middleware/authMiddleware'); // ✅ CHANGED
// const { upload } = require('../middleware/uploadMiddleware');

// // ✅ CHANGED: verifyAdmin → verifyVendor
// router.post('/bulk-update-status', verifyToken, verifyVendor, categoryController.bulkUpdateStatus);
// router.post('/reorder', verifyToken, verifyVendor, categoryController.reorderCategories);
// router.post('/', verifyToken, verifyVendor, upload.single('category_image'), categoryController.createCategory);
// router.get('/', verifyToken, verifyVendor, categoryController.getAllCategories);
// router.get('/:id', verifyToken, verifyVendor, categoryController.getCategoryById);
// router.put('/:id', verifyToken, verifyVendor, upload.single('category_image'), categoryController.updateCategory);
// router.delete('/:id', verifyToken, verifyVendor, categoryController.deleteCategory);

// module.exports = router;
// vendor to superadmin 

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, checkSuperAdmin } = require('../middleware/superAdminMiddleware'); // ✅ CHANGED
const { upload } = require('../middleware/uploadMiddleware');

// ✅ CHANGED: All routes now use SuperAdmin middleware
router.post('/bulk-update-status', verifyToken, checkSuperAdmin, categoryController.bulkUpdateStatus);
router.post('/reorder', verifyToken, checkSuperAdmin, categoryController.reorderCategories);
router.post('/', verifyToken, checkSuperAdmin, upload.single('category_image'), categoryController.createCategory);
router.get('/', verifyToken, checkSuperAdmin, categoryController.getAllCategories);
router.get('/:id', verifyToken, checkSuperAdmin, categoryController.getCategoryById);
router.put('/:id', verifyToken, checkSuperAdmin, upload.single('category_image'), categoryController.updateCategory);
router.delete('/:id', verifyToken, checkSuperAdmin, categoryController.deleteCategory);

module.exports = router;