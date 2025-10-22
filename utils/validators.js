const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Category validation rules
exports.categoryValidation = [
  body('category_name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2-50 characters'),
  body('category_description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer')
];

// Product validation rules
exports.productValidation = [
  body('product_name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3-100 characters'),
  body('category_id')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('subcategory_id')
    .optional()
    .isMongoId().withMessage('Invalid subcategory ID'),
  body('short_description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Short description must not exceed 200 characters'),
  body('variants')
    .isArray({ min: 1 }).withMessage('At least one variant is required'),
  body('variants.*.variant_name')
    .notEmpty().withMessage('Variant name is required'),
  body('variants.*.weight')
    .isNumeric().withMessage('Weight must be a number')
    .isFloat({ min: 0.01 }).withMessage('Weight must be greater than 0'),
  body('variants.*.mrp')
    .isNumeric().withMessage('MRP must be a number')
    .isFloat({ min: 1 }).withMessage('MRP must be at least 1'),
  body('variants.*.selling_price')
    .isNumeric().withMessage('Selling price must be a number')
    .isFloat({ min: 1 }).withMessage('Selling price must be at least 1')
];

// Variant validation rules
exports.variantValidation = [
  body('variant_name')
    .trim()
    .notEmpty().withMessage('Variant name is required'),
  body('weight')
    .isNumeric().withMessage('Weight must be a number')
    .isFloat({ min: 0.01 }).withMessage('Weight must be greater than 0'),
  body('mrp')
    .isNumeric().withMessage('MRP must be a number')
    .isFloat({ min: 1 }).withMessage('MRP must be at least 1'),
  body('selling_price')
    .isNumeric().withMessage('Selling price must be a number')
    .isFloat({ min: 1 }).withMessage('Selling price must be at least 1')
    .custom((value, { req }) => {
      if (value > req.body.mrp) {
        throw new Error('Selling price cannot be greater than MRP');
      }
      return true;
    })
];

// Stock update validation
exports.stockUpdateValidation = [
  body('quantity_change')
    .isInt().withMessage('Quantity change must be an integer'),
  body('action_type')
    .isIn(['restock', 'damage', 'expired', 'adjustment'])
    .withMessage('Invalid action type'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Reason must not exceed 200 characters')
];

// Pagination validation
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports.validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];